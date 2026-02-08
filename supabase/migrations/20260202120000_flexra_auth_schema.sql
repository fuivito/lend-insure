-- Flexra Auth, Tenancy & RLS Migration
-- This migration implements:
-- 1. New users and memberships tables for auth
-- 2. Organisation type support
-- 3. Membership invitations
-- 4. RLS helper functions
-- 5. Updated RLS policies based on memberships
-- 6. Data migration from broker_users

-- ============================================================================
-- PHASE 1: Create New Enums and Tables
-- ============================================================================

-- Organisation type enum
CREATE TYPE public.org_type_enum AS ENUM ('BROKER', 'MGA', 'INSURER', 'FLEXRA_INTERNAL');

-- Add org_type to organisations
ALTER TABLE public.organisations ADD COLUMN org_type public.org_type_enum NOT NULL DEFAULT 'BROKER';

-- Membership role enum (hierarchy: OWNER > ADMIN > MEMBER > READ_ONLY)
CREATE TYPE public.membership_role_enum AS ENUM ('OWNER', 'ADMIN', 'MEMBER', 'READ_ONLY');

-- Membership status enum
CREATE TYPE public.membership_status_enum AS ENUM ('INVITED', 'ACTIVE', 'SUSPENDED', 'REMOVED');

-- Create users table (1:1 with auth.users)
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index for auth_user_id lookups
CREATE INDEX idx_users_auth_user_id ON public.users(auth_user_id);
CREATE INDEX idx_users_email ON public.users(email);

-- Create memberships table
CREATE TABLE public.memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    role public.membership_role_enum NOT NULL DEFAULT 'MEMBER',
    status public.membership_status_enum NOT NULL DEFAULT 'INVITED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    -- CRITICAL: One membership per user (single org constraint)
    CONSTRAINT memberships_user_unique UNIQUE (user_id)
);

-- Create indexes for memberships
CREATE INDEX idx_memberships_organisation_id ON public.memberships(organisation_id);
CREATE INDEX idx_memberships_user_id ON public.memberships(user_id);
CREATE INDEX idx_memberships_status ON public.memberships(status);

-- Create membership_invitations table
CREATE TABLE public.membership_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role public.membership_role_enum NOT NULL DEFAULT 'MEMBER',
    token_hash TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    accepted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for invitations
CREATE INDEX idx_membership_invitations_organisation_id ON public.membership_invitations(organisation_id);
CREATE INDEX idx_membership_invitations_email ON public.membership_invitations(email);
CREATE INDEX idx_membership_invitations_token_hash ON public.membership_invitations(token_hash);

-- Create agreement_access_tokens table (for customer portal access)
CREATE TABLE public.agreement_access_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agreement_id UUID NOT NULL REFERENCES public.agreements(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_used_at TIMESTAMPTZ
);

CREATE INDEX idx_agreement_access_tokens_agreement_id ON public.agreement_access_tokens(agreement_id);
CREATE INDEX idx_agreement_access_tokens_token_hash ON public.agreement_access_tokens(token_hash);

-- Add updated_at triggers for new tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_memberships_updated_at BEFORE UPDATE ON public.memberships FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS on new tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membership_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agreement_access_tokens ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PHASE 2: Create RLS Helper Functions
-- ============================================================================

-- Get current user's org_id (single membership model)
CREATE OR REPLACE FUNCTION public.current_user_org_id()
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT m.organisation_id
    FROM public.memberships m
    JOIN public.users u ON m.user_id = u.id
    WHERE u.auth_user_id = auth.uid()
      AND m.status = 'ACTIVE';
$$;

-- Check if user is active member of specific org
CREATE OR REPLACE FUNCTION public.is_active_member_of_org(org_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.memberships m
        JOIN public.users u ON m.user_id = u.id
        WHERE u.auth_user_id = auth.uid()
          AND m.organisation_id = org_id
          AND m.status = 'ACTIVE'
    );
$$;

-- Get user's role in org
CREATE OR REPLACE FUNCTION public.current_role_in_org(org_id UUID)
RETURNS public.membership_role_enum
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT m.role
    FROM public.memberships m
    JOIN public.users u ON m.user_id = u.id
    WHERE u.auth_user_id = auth.uid()
      AND m.organisation_id = org_id
      AND m.status = 'ACTIVE';
$$;

-- Check if user is OWNER or ADMIN
CREATE OR REPLACE FUNCTION public.is_admin_in_org(org_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.memberships m
        JOIN public.users u ON m.user_id = u.id
        WHERE u.auth_user_id = auth.uid()
          AND m.organisation_id = org_id
          AND m.status = 'ACTIVE'
          AND m.role IN ('OWNER', 'ADMIN')
    );
$$;

-- Check if user has MEMBER+ access (can create/modify data)
CREATE OR REPLACE FUNCTION public.is_member_or_above_in_org(org_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.memberships m
        JOIN public.users u ON m.user_id = u.id
        WHERE u.auth_user_id = auth.uid()
          AND m.organisation_id = org_id
          AND m.status = 'ACTIVE'
          AND m.role IN ('OWNER', 'ADMIN', 'MEMBER')
    );
$$;

-- ============================================================================
-- PHASE 3: Drop Existing RLS Policies
-- ============================================================================

-- Drop existing policies for organisations
DROP POLICY IF EXISTS "Brokers can view their organisation" ON public.organisations;

-- Drop existing policies for broker_users
DROP POLICY IF EXISTS "Brokers can view users in their organisation" ON public.broker_users;

-- Drop existing policies for clients
DROP POLICY IF EXISTS "Brokers can view clients in their organisation" ON public.clients;
DROP POLICY IF EXISTS "Brokers can create clients in their organisation" ON public.clients;
DROP POLICY IF EXISTS "Brokers can update clients in their organisation" ON public.clients;

-- Drop existing policies for policies
DROP POLICY IF EXISTS "Brokers can view policies in their organisation" ON public.policies;
DROP POLICY IF EXISTS "Brokers can create policies in their organisation" ON public.policies;

-- Drop existing policies for agreements
DROP POLICY IF EXISTS "Brokers can view agreements in their organisation" ON public.agreements;
DROP POLICY IF EXISTS "Brokers can create agreements in their organisation" ON public.agreements;
DROP POLICY IF EXISTS "Brokers can update agreements in their organisation" ON public.agreements;

-- Drop existing policies for instalments
DROP POLICY IF EXISTS "Brokers can view instalments for their agreements" ON public.instalments;

-- Drop existing policies for audit_logs
DROP POLICY IF EXISTS "Brokers can view audit logs in their organisation" ON public.audit_logs;

-- ============================================================================
-- PHASE 4: Create New RLS Policies
-- ============================================================================

-- ----- USERS TABLE -----
-- Users can only see their own record
CREATE POLICY "Users can view own record" ON public.users
    FOR SELECT USING (auth_user_id = auth.uid());

-- Users can update their own record
CREATE POLICY "Users can update own record" ON public.users
    FOR UPDATE USING (auth_user_id = auth.uid());

-- ----- ORGANISATIONS TABLE -----
-- Active members can view their organisation
CREATE POLICY "Active members can view organisation" ON public.organisations
    FOR SELECT USING (public.is_active_member_of_org(id));

-- Admins can update their organisation
CREATE POLICY "Admins can update organisation" ON public.organisations
    FOR UPDATE USING (public.is_admin_in_org(id));

-- ----- MEMBERSHIPS TABLE -----
-- Members can view memberships in their org
CREATE POLICY "Members can view org memberships" ON public.memberships
    FOR SELECT USING (public.is_active_member_of_org(organisation_id));

-- Admins can create memberships in their org
CREATE POLICY "Admins can create memberships" ON public.memberships
    FOR INSERT WITH CHECK (public.is_admin_in_org(organisation_id));

-- Admins can update memberships in their org
CREATE POLICY "Admins can update memberships" ON public.memberships
    FOR UPDATE USING (public.is_admin_in_org(organisation_id));

-- Admins can delete memberships in their org
CREATE POLICY "Admins can delete memberships" ON public.memberships
    FOR DELETE USING (public.is_admin_in_org(organisation_id));

-- ----- MEMBERSHIP_INVITATIONS TABLE -----
-- Admins can view invitations in their org
CREATE POLICY "Admins can view invitations" ON public.membership_invitations
    FOR SELECT USING (public.is_admin_in_org(organisation_id));

-- Admins can create invitations in their org
CREATE POLICY "Admins can create invitations" ON public.membership_invitations
    FOR INSERT WITH CHECK (public.is_admin_in_org(organisation_id));

-- Admins can update invitations in their org
CREATE POLICY "Admins can update invitations" ON public.membership_invitations
    FOR UPDATE USING (public.is_admin_in_org(organisation_id));

-- Admins can delete invitations in their org
CREATE POLICY "Admins can delete invitations" ON public.membership_invitations
    FOR DELETE USING (public.is_admin_in_org(organisation_id));

-- ----- CLIENTS TABLE -----
-- Active members can view clients in their org
CREATE POLICY "Active members can view clients" ON public.clients
    FOR SELECT USING (public.is_active_member_of_org(organisation_id));

-- MEMBER+ can create clients in their org
CREATE POLICY "Members can create clients" ON public.clients
    FOR INSERT WITH CHECK (public.is_member_or_above_in_org(organisation_id));

-- MEMBER+ can update clients in their org
CREATE POLICY "Members can update clients" ON public.clients
    FOR UPDATE USING (public.is_member_or_above_in_org(organisation_id));

-- Admins can delete clients in their org
CREATE POLICY "Admins can delete clients" ON public.clients
    FOR DELETE USING (public.is_admin_in_org(organisation_id));

-- ----- POLICIES TABLE -----
-- Active members can view policies in their org
CREATE POLICY "Active members can view policies" ON public.policies
    FOR SELECT USING (public.is_active_member_of_org(organisation_id));

-- MEMBER+ can create policies in their org
CREATE POLICY "Members can create policies" ON public.policies
    FOR INSERT WITH CHECK (public.is_member_or_above_in_org(organisation_id));

-- MEMBER+ can update policies in their org
CREATE POLICY "Members can update policies" ON public.policies
    FOR UPDATE USING (public.is_member_or_above_in_org(organisation_id));

-- ----- AGREEMENTS TABLE -----
-- Active members can view agreements in their org
CREATE POLICY "Active members can view agreements" ON public.agreements
    FOR SELECT USING (public.is_active_member_of_org(organisation_id));

-- MEMBER+ can create agreements in their org
CREATE POLICY "Members can create agreements" ON public.agreements
    FOR INSERT WITH CHECK (public.is_member_or_above_in_org(organisation_id));

-- MEMBER+ can update agreements in their org
CREATE POLICY "Members can update agreements" ON public.agreements
    FOR UPDATE USING (public.is_member_or_above_in_org(organisation_id));

-- ----- INSTALMENTS TABLE -----
-- Active members can view instalments for their org's agreements
CREATE POLICY "Active members can view instalments" ON public.instalments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.agreements a
            WHERE a.id = agreement_id
              AND public.is_active_member_of_org(a.organisation_id)
        )
    );

-- MEMBER+ can create instalments for their org's agreements
CREATE POLICY "Members can create instalments" ON public.instalments
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.agreements a
            WHERE a.id = agreement_id
              AND public.is_member_or_above_in_org(a.organisation_id)
        )
    );

-- MEMBER+ can update instalments for their org's agreements
CREATE POLICY "Members can update instalments" ON public.instalments
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.agreements a
            WHERE a.id = agreement_id
              AND public.is_member_or_above_in_org(a.organisation_id)
        )
    );

-- ----- AUDIT_LOGS TABLE -----
-- Active members can view audit logs in their org
CREATE POLICY "Active members can view audit logs" ON public.audit_logs
    FOR SELECT USING (public.is_active_member_of_org(organisation_id));

-- ----- AGREEMENT_ACCESS_TOKENS TABLE -----
-- No direct RLS access - service role only for security
-- These are managed by the backend

-- ----- BROKER_USERS TABLE (Legacy) -----
-- Keep read access for migration period
CREATE POLICY "Legacy broker users read access" ON public.broker_users
    FOR SELECT USING (public.is_active_member_of_org(organisation_id));

-- ============================================================================
-- PHASE 5: Data Migration
-- ============================================================================

-- Note: This migration assumes auth.users already exist for any broker_users with auth_user_id
-- For broker_users without auth_user_id, they will need to sign up fresh

-- Create users from broker_users that have auth_user_id
INSERT INTO public.users (auth_user_id, email, name, created_at, updated_at)
SELECT
    bu.auth_user_id,
    bu.email,
    CONCAT(bu.first_name, ' ', bu.last_name),
    bu.created_at,
    COALESCE(bu.updated_at, bu.created_at)
FROM public.broker_users bu
WHERE bu.auth_user_id IS NOT NULL
ON CONFLICT (auth_user_id) DO NOTHING;

-- Create memberships from broker_users
INSERT INTO public.memberships (organisation_id, user_id, role, status, created_at, updated_at)
SELECT
    bu.organisation_id,
    u.id,
    CASE bu.role
        WHEN 'BROKER_ADMIN' THEN 'ADMIN'::public.membership_role_enum
        WHEN 'BROKER' THEN 'MEMBER'::public.membership_role_enum
        WHEN 'INTERNAL' THEN 'ADMIN'::public.membership_role_enum
    END,
    'ACTIVE'::public.membership_status_enum,
    bu.created_at,
    COALESCE(bu.updated_at, bu.created_at)
FROM public.broker_users bu
JOIN public.users u ON u.auth_user_id = bu.auth_user_id
WHERE bu.auth_user_id IS NOT NULL
ON CONFLICT (user_id) DO NOTHING;

-- Set first admin per org as OWNER
WITH first_admin AS (
    SELECT DISTINCT ON (organisation_id) id
    FROM public.memberships
    WHERE role = 'ADMIN'
    ORDER BY organisation_id, created_at ASC
)
UPDATE public.memberships
SET role = 'OWNER'
WHERE id IN (SELECT id FROM first_admin);

-- ============================================================================
-- PHASE 6: Deprecate Old Tables (Keep for rollback safety)
-- ============================================================================

-- Rename old tables instead of dropping
-- These can be dropped after confirming migration success
COMMENT ON TABLE public.broker_users IS 'DEPRECATED: Use users and memberships tables. Kept for rollback safety.';
COMMENT ON TABLE public.user_roles IS 'DEPRECATED: Use memberships table. Kept for rollback safety.';

-- Drop the old has_role function as it's no longer used
DROP FUNCTION IF EXISTS public.has_role(UUID, public.broker_role_enum);
