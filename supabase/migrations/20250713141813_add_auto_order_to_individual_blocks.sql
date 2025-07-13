-- Add auto_order column to individual_blocks table
ALTER TABLE "public"."individual_blocks" 
ADD COLUMN "auto_order" integer;

-- Add comment for the new column
COMMENT ON COLUMN "public"."individual_blocks"."auto_order" IS 'Order value from Airtable for sorting individual blocks within a block overview'; 