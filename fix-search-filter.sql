-- Test queries to verify search and filter work correctly

-- Test 1: Search by skill "React"
SELECT a.*, u.name as assigned_to_name 
FROM applications a
LEFT JOIN users u ON a.assigned_to = u.id
WHERE a.uploaded_by = 1 AND a.source = 'dashboard'
AND (a.primary_skill ILIKE '%React%' OR a.secondary_skill ILIKE '%React%' OR a.parsed_data::text ILIKE '%React%');

-- Test 2: Filter by experience 3-7 years
SELECT a.*, u.name as uploader_name 
FROM applications a
LEFT JOIN users u ON a.uploaded_by = u.id
WHERE (a.placement_status IS NULL OR a.placement_status <> 'Onboarded')
AND a.experience_years >= 3
AND a.experience_years <= 7;

-- Test 3: Filter by multiple skills
SELECT a.*, u.name as uploader_name 
FROM applications a
LEFT JOIN users u ON a.uploaded_by = u.id
WHERE (a.placement_status IS NULL OR a.placement_status <> 'Onboarded')
AND (
  a.primary_skill ILIKE '%React%' OR a.secondary_skill ILIKE '%React%' OR a.parsed_data::text ILIKE '%React%'
  OR a.primary_skill ILIKE '%Node%' OR a.secondary_skill ILIKE '%Node%' OR a.parsed_data::text ILIKE '%Node%'
);
