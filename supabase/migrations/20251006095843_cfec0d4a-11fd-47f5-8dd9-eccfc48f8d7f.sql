-- Create cash_book_entries table for double-column cash book
CREATE TABLE IF NOT EXISTS public.cash_book_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id TEXT NOT NULL,
  period_id UUID NOT NULL,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  particulars TEXT NOT NULL,
  voucher_number TEXT,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('receipt', 'payment')),
  account_type TEXT NOT NULL CHECK (account_type IN ('cash', 'bank')),
  account_name TEXT NOT NULL,
  amount NUMERIC(15,2) NOT NULL DEFAULT 0,
  contra_account TEXT,
  narration TEXT,
  posted_to_ledger BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cash_book_entries ENABLE ROW LEVEL SECURITY;

-- Create policies for cash book entries
CREATE POLICY "Users can manage own cash book entries"
  ON public.cash_book_entries
  FOR ALL
  USING (client_id IN (SELECT c.client_id FROM clients c WHERE c.user_id = auth.uid()));

CREATE POLICY "Allow legacy system access to cash book entries"
  ON public.cash_book_entries
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create index for performance
CREATE INDEX idx_cash_book_client_period ON public.cash_book_entries(client_id, period_id);
CREATE INDEX idx_cash_book_date ON public.cash_book_entries(entry_date);

-- Create trigger to update updated_at
CREATE TRIGGER update_cash_book_updated_at
  BEFORE UPDATE ON public.cash_book_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to automatically post cash book entries to general ledger
CREATE OR REPLACE FUNCTION public.post_cash_book_to_ledger()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  cash_account_id UUID;
  contra_account_id UUID;
BEGIN
  -- Get or create the cash/bank account in the accounts table
  SELECT id INTO cash_account_id
  FROM public.accounts
  WHERE client_id = NEW.client_id 
    AND account_name = NEW.account_name
  LIMIT 1;

  -- If account doesn't exist, create it
  IF cash_account_id IS NULL THEN
    INSERT INTO public.accounts (client_id, account_code, account_name, account_type, is_active)
    VALUES (
      NEW.client_id,
      CASE 
        WHEN NEW.account_type = 'cash' THEN 'CASH-' || NEW.account_name
        ELSE 'BANK-' || NEW.account_name
      END,
      NEW.account_name,
      'Asset',
      true
    )
    RETURNING id INTO cash_account_id;
  END IF;

  -- Post to general ledger
  IF NEW.transaction_type = 'receipt' THEN
    -- Receipt: Debit Cash/Bank, Credit Contra Account
    INSERT INTO public.general_ledger (
      client_id, period_id, account_id, transaction_date, 
      description, debit_amount, credit_amount, reference_type, reference_id
    ) VALUES 
    (NEW.client_id, NEW.period_id, cash_account_id, NEW.entry_date,
     NEW.particulars || ' (Cash Book Receipt)', NEW.amount, 0, 'cash_book', NEW.id);
  ELSE
    -- Payment: Credit Cash/Bank, Debit Contra Account
    INSERT INTO public.general_ledger (
      client_id, period_id, account_id, transaction_date,
      description, debit_amount, credit_amount, reference_type, reference_id
    ) VALUES 
    (NEW.client_id, NEW.period_id, cash_account_id, NEW.entry_date,
     NEW.particulars || ' (Cash Book Payment)', 0, NEW.amount, 'cash_book', NEW.id);
  END IF;

  -- Mark as posted
  NEW.posted_to_ledger := true;

  RETURN NEW;
END;
$$;

-- Create trigger to auto-post to ledger
CREATE TRIGGER auto_post_cash_book_to_ledger
  BEFORE INSERT ON public.cash_book_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.post_cash_book_to_ledger();

-- Function to handle updates
CREATE OR REPLACE FUNCTION public.update_cash_book_ledger_entry()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Delete old ledger entries
  DELETE FROM public.general_ledger
  WHERE reference_type = 'cash_book' AND reference_id = OLD.id;

  -- Re-insert updated entry
  IF NEW.transaction_type = 'receipt' THEN
    INSERT INTO public.general_ledger (
      client_id, period_id, account_id, transaction_date,
      description, debit_amount, credit_amount, reference_type, reference_id
    )
    SELECT NEW.client_id, NEW.period_id, a.id, NEW.entry_date,
           NEW.particulars || ' (Cash Book Receipt)', NEW.amount, 0, 'cash_book', NEW.id
    FROM public.accounts a
    WHERE a.client_id = NEW.client_id AND a.account_name = NEW.account_name
    LIMIT 1;
  ELSE
    INSERT INTO public.general_ledger (
      client_id, period_id, account_id, transaction_date,
      description, debit_amount, credit_amount, reference_type, reference_id
    )
    SELECT NEW.client_id, NEW.period_id, a.id, NEW.entry_date,
           NEW.particulars || ' (Cash Book Payment)', 0, NEW.amount, 'cash_book', NEW.id
    FROM public.accounts a
    WHERE a.client_id = NEW.client_id AND a.account_name = NEW.account_name
    LIMIT 1;
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger for updates
CREATE TRIGGER update_cash_book_ledger_entry
  AFTER UPDATE ON public.cash_book_entries
  FOR EACH ROW
  WHEN (OLD.* IS DISTINCT FROM NEW.*)
  EXECUTE FUNCTION public.update_cash_book_ledger_entry();

-- Function to handle deletes
CREATE OR REPLACE FUNCTION public.delete_cash_book_ledger_entry()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Delete corresponding ledger entries
  DELETE FROM public.general_ledger
  WHERE reference_type = 'cash_book' AND reference_id = OLD.id;

  RETURN OLD;
END;
$$;

-- Create trigger for deletes
CREATE TRIGGER delete_cash_book_ledger_entry
  BEFORE DELETE ON public.cash_book_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.delete_cash_book_ledger_entry();