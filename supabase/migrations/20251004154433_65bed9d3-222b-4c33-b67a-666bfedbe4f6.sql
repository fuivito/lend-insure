-- Seed policies and agreements from mock data

-- Create policies for each agreement
INSERT INTO public.policies (id, organisation_id, client_id, policy_number, insurer, product_type, premium_amount_pennies, start_date, end_date) VALUES
    -- Policies for client Sarah Johnson (3 agreements)
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', '550e8400-e29b-41d4-a716-446655440000', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'POL-2024-001', 'Motor Insurer Ltd', 'Motor Insurance', 120000, '2024-01-15', '2025-01-15'),
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', '550e8400-e29b-41d4-a716-446655440000', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'POL-2024-002', 'Home Guard Insurance', 'Home Insurance', 85000, '2024-03-01', '2025-03-01'),
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', '550e8400-e29b-41d4-a716-446655440000', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'POL-2023-003', 'Travel Safe Inc', 'Travel Insurance', 45000, '2023-06-10', '2024-06-10'),
    -- Policy for Michael Chen
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', '550e8400-e29b-41d4-a716-446655440000', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'POL-2024-004', 'Property Protect', 'Home Insurance', 110000, '2024-02-20', '2025-02-20'),
    -- Policies for Emma Wilson (2 agreements)
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', '550e8400-e29b-41d4-a716-446655440000', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'POL-2024-005', 'Business Shield Ltd', 'Business Insurance', 220000, '2024-01-05', '2025-01-05'),
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a06', '550e8400-e29b-41d4-a716-446655440000', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'POL-2024-006', 'Auto Care Insurance', 'Motor Insurance', 95000, '2024-04-15', '2025-04-15'),
    -- Policy for David Thompson
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a07', '550e8400-e29b-41d4-a716-446655440000', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'POL-2024-007', 'Pet Care Insurance', 'Pet Insurance', 38000, '2024-03-10', '2025-03-10'),
    -- Policies for Jessica Brown (4 agreements)
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a08', '550e8400-e29b-41d4-a716-446655440000', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'POL-2024-008', 'Enterprise Insurance Co', 'Business Insurance', 320000, '2024-01-25', '2025-01-25'),
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a09', '550e8400-e29b-41d4-a716-446655440000', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'POL-2024-009', 'Professional Cover Ltd', 'Professional Indemnity', 180000, '2024-02-10', '2025-02-10'),
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a10', '550e8400-e29b-41d4-a716-446655440000', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'POL-2023-010', 'Motor Plus Insurance', 'Motor Insurance', 105000, '2023-12-01', '2024-12-01'),
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '550e8400-e29b-41d4-a716-446655440000', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'POL-2024-011', 'Liability Shield Inc', 'Public Liability', 95000, '2024-05-01', '2025-05-01'),
    -- Policies for Robert Lee (2 agreements)
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', '550e8400-e29b-41d4-a716-446655440000', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'POL-2024-012', 'Property First Insurance', 'Property Insurance', 160000, '2024-03-20', '2025-03-20'),
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '550e8400-e29b-41d4-a716-446655440000', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'POL-2024-013', 'Contents Cover Ltd', 'Contents Insurance', 75000, '2024-01-10', '2025-01-10');

-- Create agreements
INSERT INTO public.agreements (id, organisation_id, client_id, policy_id, principal_amount_pennies, apr_bps, term_months, broker_fee_bps, status, signed_at, activated_at, created_at) VALUES
    -- Sarah Johnson's agreements
    ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', '550e8400-e29b-41d4-a716-446655440000', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 120000, 850, 12, 500, 'ACTIVE', '2024-01-15', '2024-01-15', '2024-01-15'),
    ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', '550e8400-e29b-41d4-a716-446655440000', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 85000, 780, 12, 500, 'ACTIVE', '2024-03-01', '2024-03-01', '2024-03-01'),
    ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', '550e8400-e29b-41d4-a716-446655440000', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 45000, 920, 12, 500, 'TERMINATED', '2023-06-10', '2023-06-10', '2023-06-10'),
    -- Michael Chen's agreement
    ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', '550e8400-e29b-41d4-a716-446655440000', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', 110000, 690, 12, 500, 'ACTIVE', '2024-02-20', '2024-02-20', '2024-02-20'),
    -- Emma Wilson's agreements
    ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', '550e8400-e29b-41d4-a716-446655440000', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', 220000, 810, 12, 500, 'ACTIVE', '2024-01-05', '2024-01-05', '2024-01-05'),
    ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a06', '550e8400-e29b-41d4-a716-446655440000', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a06', 95000, 750, 12, 500, 'PROPOSED', NULL, NULL, '2024-04-15'),
    -- David Thompson's agreement
    ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a07', '550e8400-e29b-41d4-a716-446655440000', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a07', 38000, 900, 12, 500, 'ACTIVE', '2024-03-10', '2024-03-10', '2024-03-10'),
    -- Jessica Brown's agreements
    ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a08', '550e8400-e29b-41d4-a716-446655440000', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a08', 320000, 720, 12, 500, 'ACTIVE', '2024-01-25', '2024-01-25', '2024-01-25'),
    ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a09', '550e8400-e29b-41d4-a716-446655440000', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a09', 180000, 880, 12, 500, 'ACTIVE', '2024-02-10', '2024-02-10', '2024-02-10'),
    ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a10', '550e8400-e29b-41d4-a716-446655440000', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a10', 105000, 830, 12, 500, 'DEFAULTED', '2023-12-01', '2023-12-01', '2023-12-01'),
    ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '550e8400-e29b-41d4-a716-446655440000', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 95000, 790, 12, 500, 'PROPOSED', NULL, NULL, '2024-05-01'),
    -- Robert Lee's agreements
    ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', '550e8400-e29b-41d4-a716-446655440000', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 160000, 840, 12, 500, 'ACTIVE', '2024-03-20', '2024-03-20', '2024-03-20'),
    ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '550e8400-e29b-41d4-a716-446655440000', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 75000, 760, 12, 500, 'ACTIVE', '2024-01-10', '2024-01-10', '2024-01-10');