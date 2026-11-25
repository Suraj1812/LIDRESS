PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS users (
 id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE COLLATE NOCASE,
 password_hash TEXT NOT NULL, salt TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS sessions (
 token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 expires_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS sessions_expiry ON sessions(expires_at);
CREATE TABLE IF NOT EXISTS cart_items (
 user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, product_id INTEGER NOT NULL,
 size TEXT NOT NULL, quantity INTEGER NOT NULL CHECK(quantity BETWEEN 1 AND 10),
 PRIMARY KEY (user_id, product_id, size)
);
CREATE TABLE IF NOT EXISTS wishlist (
 user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, product_id INTEGER NOT NULL,
 PRIMARY KEY(user_id,product_id)
);
CREATE TABLE IF NOT EXISTS addresses (
 id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 data TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS inventory (product_id INTEGER PRIMARY KEY, stock INTEGER NOT NULL CHECK(stock>=0));
CREATE TABLE IF NOT EXISTS orders (
 id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id), address TEXT NOT NULL,
 subtotal INTEGER NOT NULL, discount INTEGER NOT NULL, shipping INTEGER NOT NULL, total INTEGER NOT NULL,
 coupon TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT 'placed' CHECK(status IN ('placed','cancelled')),
 idempotency_key TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 UNIQUE(user_id,idempotency_key)
);
CREATE TABLE IF NOT EXISTS order_items (
 id INTEGER PRIMARY KEY AUTOINCREMENT, order_id TEXT NOT NULL REFERENCES orders(id),
 product_id INTEGER NOT NULL REFERENCES inventory(product_id), title TEXT NOT NULL, image TEXT NOT NULL,
 size TEXT NOT NULL, quantity INTEGER NOT NULL CHECK(quantity BETWEEN 1 AND 10), price INTEGER NOT NULL
);
CREATE TRIGGER IF NOT EXISTS check_stock BEFORE INSERT ON order_items
BEGIN
 SELECT CASE WHEN (SELECT stock FROM inventory WHERE product_id=NEW.product_id)<NEW.quantity
 THEN RAISE(ABORT,'OUT_OF_STOCK') END;
END;
CREATE TRIGGER IF NOT EXISTS reserve_stock AFTER INSERT ON order_items
BEGIN UPDATE inventory SET stock=stock-NEW.quantity WHERE product_id=NEW.product_id; END;
CREATE TRIGGER IF NOT EXISTS restore_cancelled_stock AFTER UPDATE OF status ON orders
WHEN NEW.status='cancelled' AND OLD.status='placed'
BEGIN
 UPDATE inventory SET stock=stock+(SELECT SUM(quantity) FROM order_items WHERE order_id=NEW.id AND order_items.product_id=inventory.product_id)
 WHERE product_id IN (SELECT product_id FROM order_items WHERE order_id=NEW.id);
END;
CREATE TABLE IF NOT EXISTS reviews (
 id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id), product_id INTEGER NOT NULL,
 rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5), title TEXT NOT NULL, comment TEXT NOT NULL,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, UNIQUE(user_id,product_id)
);
