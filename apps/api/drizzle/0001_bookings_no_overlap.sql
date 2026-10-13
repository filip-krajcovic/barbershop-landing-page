-- Jeden barber nemôže mať dve aktívne rezervácie, ktorých časy sa prekrývajú.
-- Interval je polootvorený [starts_at, ends_at), takže termíny tesne za sebou sú v poriadku.
-- Drizzle EXCLUDE constraint nepodporuje, preto je to vlastná migrácia.
CREATE EXTENSION IF NOT EXISTS btree_gist;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_no_overlap"
  EXCLUDE USING gist ("barber_id" WITH =, tstzrange("starts_at", "ends_at", '[)') WITH &&)
  WHERE ("status" IN ('pending', 'confirmed'));
