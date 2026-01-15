-- Add is_master column to resumes table
ALTER TABLE public.resumes 
ADD COLUMN IF NOT EXISTS is_master BOOLEAN DEFAULT FALSE;

-- Create an index for faster lookup of master resume
CREATE INDEX IF NOT EXISTS idx_resumes_user_master 
ON public.resumes(user_id) 
WHERE is_master = TRUE;

-- Ensure only one master resume per user (Partial Unique Index)
-- Note: This might be too strict if we want to soft-delete or keep history, 
-- but for now enforcing one master resume seems appropriate. 
-- However, since simple updates might be easier without a hard constraint if we handle it in code, 
-- I will rely on the application logic to unset previous master resumes. 
-- But adding a unique index is safer for data integrity.
-- CREATE UNIQUE INDEX idx_unique_master_resume ON public.resumes (user_id) WHERE is_master = TRUE;
