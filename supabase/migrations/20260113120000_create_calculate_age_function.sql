CREATE OR REPLACE FUNCTION calculate_age(birth_date DATE)
RETURNS INT AS $$
BEGIN
    RETURN CASE 
        WHEN birth_date IS NOT NULL THEN
            DATE_PART('year', AGE(NOW(), birth_date))
        ELSE
            NULL
    END;
END;
$$ LANGUAGE plpgsql;