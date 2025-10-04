-- Create enums
CREATE TYPE public.broker_role_enum AS ENUM ('BROKER', 'BROKER_ADMIN', 'INTERNAL');
CREATE TYPE public.agreement_status_enum AS ENUM ('DRAFT', 'PROPOSED', 'SIGNED', 'ACTIVE', 'DEFAULTED', 'TERMINATED');
CREATE TYPE public.instalment_status_enum AS ENUM ('UPCOMING', 'PAID', 'MISSED');
CREATE TYPE public.organisation_status_enum AS ENUM ('ACTIVE', 'SUSPENDED', 'INACTIVE');

-- Create organisations table
CREATE TABLE public.organisations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    status public.organisation_status_enum NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create broker_users table
CREATE TABLE public.broker_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    role public.broker_role_enum NOT NULL DEFAULT 'BROKER',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user_roles table (for RBAC security)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role public.broker_role_enum NOT NULL,
    organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
    UNIQUE(user_id, role)
);

-- Create clients table
CREATE TABLE public.clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    address_line1 TEXT,
    address_line2 TEXT,
    city TEXT,
    postcode TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create policies table
CREATE TABLE public.policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    policy_number TEXT NOT NULL UNIQUE,
    insurer TEXT NOT NULL,
    product_type TEXT NOT NULL,
    premium_amount_pennies BIGINT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create agreements table
CREATE TABLE public.agreements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    policy_id UUID NOT NULL REFERENCES public.policies(id) ON DELETE CASCADE,
    principal_amount_pennies BIGINT NOT NULL,
    apr_bps INTEGER NOT NULL,
    term_months INTEGER NOT NULL,
    broker_fee_bps INTEGER NOT NULL DEFAULT 0,
    status public.agreement_status_enum NOT NULL DEFAULT 'DRAFT',
    signed_at TIMESTAMPTZ,
    activated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create instalments table
CREATE TABLE public.instalments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agreement_id UUID NOT NULL REFERENCES public.agreements(id) ON DELETE CASCADE,
    sequence_number INTEGER NOT NULL,
    due_date DATE NOT NULL,
    amount_pennies BIGINT NOT NULL,
    status public.instalment_status_enum NOT NULL DEFAULT 'UPCOMING',
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(agreement_id, sequence_number)
);

-- Create audit_logs table
CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
    actor_type TEXT NOT NULL,
    action TEXT NOT NULL,
    entity TEXT NOT NULL,
    before JSONB,
    after JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_organisations_updated_at BEFORE UPDATE ON public.organisations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_broker_users_updated_at BEFORE UPDATE ON public.broker_users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_policies_updated_at BEFORE UPDATE ON public.policies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_agreements_updated_at BEFORE UPDATE ON public.agreements FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_instalments_updated_at BEFORE UPDATE ON public.instalments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.organisations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.broker_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instalments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.broker_role_enum)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- RLS Policies for organisations
CREATE POLICY "Brokers can view their organisation" ON public.organisations FOR SELECT USING (
    id IN (SELECT organisation_id FROM public.user_roles WHERE user_id = auth.uid())
);

-- RLS Policies for broker_users
CREATE POLICY "Brokers can view users in their organisation" ON public.broker_users FOR SELECT USING (
    organisation_id IN (SELECT organisation_id FROM public.user_roles WHERE user_id = auth.uid())
);

-- RLS Policies for clients
CREATE POLICY "Brokers can view clients in their organisation" ON public.clients FOR SELECT USING (
    organisation_id IN (SELECT organisation_id FROM public.user_roles WHERE user_id = auth.uid())
);

CREATE POLICY "Brokers can create clients in their organisation" ON public.clients FOR INSERT WITH CHECK (
    organisation_id IN (SELECT organisation_id FROM public.user_roles WHERE user_id = auth.uid())
);

CREATE POLICY "Brokers can update clients in their organisation" ON public.clients FOR UPDATE USING (
    organisation_id IN (SELECT organisation_id FROM public.user_roles WHERE user_id = auth.uid())
);

-- RLS Policies for policies
CREATE POLICY "Brokers can view policies in their organisation" ON public.policies FOR SELECT USING (
    organisation_id IN (SELECT organisation_id FROM public.user_roles WHERE user_id = auth.uid())
);

CREATE POLICY "Brokers can create policies in their organisation" ON public.policies FOR INSERT WITH CHECK (
    organisation_id IN (SELECT organisation_id FROM public.user_roles WHERE user_id = auth.uid())
);

-- RLS Policies for agreements
CREATE POLICY "Brokers can view agreements in their organisation" ON public.agreements FOR SELECT USING (
    organisation_id IN (SELECT organisation_id FROM public.user_roles WHERE user_id = auth.uid())
);

CREATE POLICY "Brokers can create agreements in their organisation" ON public.agreements FOR INSERT WITH CHECK (
    organisation_id IN (SELECT organisation_id FROM public.user_roles WHERE user_id = auth.uid())
);

CREATE POLICY "Brokers can update agreements in their organisation" ON public.agreements FOR UPDATE USING (
    organisation_id IN (SELECT organisation_id FROM public.user_roles WHERE user_id = auth.uid())
);

-- RLS Policies for instalments
CREATE POLICY "Brokers can view instalments for their agreements" ON public.instalments FOR SELECT USING (
    agreement_id IN (
        SELECT id FROM public.agreements 
        WHERE organisation_id IN (SELECT organisation_id FROM public.user_roles WHERE user_id = auth.uid())
    )
);

-- RLS Policies for audit_logs
CREATE POLICY "Brokers can view audit logs in their organisation" ON public.audit_logs FOR SELECT USING (
    organisation_id IN (SELECT organisation_id FROM public.user_roles WHERE user_id = auth.uid())
);

-- Seed demo organisation
INSERT INTO public.organisations (id, name, status) VALUES 
    ('550e8400-e29b-41d4-a716-446655440000', 'Demo Insurance Brokers Ltd', 'ACTIVE');

-- Seed demo broker users
INSERT INTO public.broker_users (id, organisation_id, email, first_name, last_name, role) VALUES 
    ('650e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 'admin@demobrokers.com', 'Admin', 'User', 'BROKER_ADMIN'),
    ('650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'broker@demobrokers.com', 'Demo', 'Broker', 'BROKER');

-- Seed clients from mockBrokerClients (using proper UUIDs)
INSERT INTO public.clients (id, organisation_id, first_name, last_name, email, phone, created_at) VALUES
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '550e8400-e29b-41d4-a716-446655440000', 'Sarah', 'Johnson', 'sarah.johnson@motorinsurance.com', '+44 7700 900123', '2024-09-08'),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', '550e8400-e29b-41d4-a716-446655440000', 'Michael', 'Chen', 'm.chen@homeprotect.co.uk', '+44 7700 900456', '2024-09-07'),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '550e8400-e29b-41d4-a716-446655440000', 'Emma', 'Wilson', 'emma.wilson@travelinsure.com', '+44 7700 900789', '2024-09-06'),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', '550e8400-e29b-41d4-a716-446655440000', 'David', 'Thompson', 'david.t@petcare.org', '+44 7700 900012', '2024-09-05'),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', '550e8400-e29b-41d4-a716-446655440000', 'Jessica', 'Brown', 'j.brown@businesscover.co.uk', '+44 7700 900345', '2024-09-04'),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', '550e8400-e29b-41d4-a716-446655440000', 'Robert', 'Lee', 'rob.lee@propertyguard.com', '+44 7700 900678', '2024-09-03'),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', '550e8400-e29b-41d4-a716-446655440000', 'Lisa', 'Martinez', 'lisa.martinez@healthfirst.org', '+44 7700 900901', '2024-09-02'),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a18', '550e8400-e29b-41d4-a716-446655440000', 'James', 'Anderson', 'james.anderson@autocare.co.uk', '+44 7700 900234', '2024-09-01');