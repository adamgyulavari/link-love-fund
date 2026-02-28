ALTER TABLE public.tips
  ADD COLUMN mollie_payment_id TEXT UNIQUE,
  ADD COLUMN status TEXT NOT NULL DEFAULT 'pending';

CREATE POLICY "Edge functions can update tips" ON public.tips
  FOR UPDATE USING (true) WITH CHECK (true);
