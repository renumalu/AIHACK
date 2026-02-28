-- RPC function to update user role (for admin use)
CREATE OR REPLACE FUNCTION update_user_role(user_id uuid, new_role user_role)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if caller is admin
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only admins can update user roles';
  END IF;
  
  -- Update the role
  UPDATE profiles
  SET role = new_role
  WHERE id = user_id;
END;
$$;