import { useState, useEffect, useCallback, useRef, useContext, createContext, useReducer } from "react";

// ─── Context & Reducer ───────────────────────────────────────────────────────
const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case "ADD": {
      const existing = state.find(i => i.id === action.item.id);
      if (existing) return state.map(i => i.id === action.item.id ? { ...i, qty: i.qty + 1 } : i);
      return [...state, { ...action.item, qty: 1 }];
    }
    case "REMOVE": return state.filter(i => i.id !== action.id);
    case "INCREMENT": return state.map(i => i.id === action.id ? { ...i, qty: i.qty + 1 } : i);
    case "DECREMENT": return state.map(i => i.id === action.id ? { ...i, qty: Math.max(1, i.qty - 1) } : i);
    case "CLEAR": return [];
    default: return state;
  }
};

// ─── Data ────────────────────────────────────────────────────────────────────
const PRODUCTS = [
  { id: 1, name: "Samsung Galaxy S24 Ultra", category: "Mobiles", price: 134999, originalPrice: 149999, rating: 4.8, reviews: 2341, image: "📱", badge: "HOT", specs: ["12GB RAM", "512GB", "200MP Camera", "5000mAh"], brand: "Samsung" },
  { id: 2, name: "Apple iPhone 15 Pro Max", category: "Mobiles", price: 159900, originalPrice: 179900, rating: 4.9, reviews: 5123, image: "📱", badge: "BESTSELLER", specs: ["8GB RAM", "256GB", "48MP Camera", "A17 Pro"], brand: "Apple" },
  { id: 3, name: "Sony WH-1000XM5", category: "Audio", price: 29990, originalPrice: 34990, rating: 4.7, reviews: 1876, image: "🎧", badge: "SALE", specs: ["ANC", "30hr Battery", "Hi-Res Audio", "Multipoint"], brand: "Sony" },
  { id: 4, name: "MacBook Pro 14\" M3", category: "Laptops", price: 198900, originalPrice: 219900, rating: 4.9, reviews: 987, image: "💻", badge: "NEW", specs: ["M3 Pro", "18GB RAM", "512GB SSD", "18hr Battery"], brand: "Apple" },
  { id: 5, name: "Dell XPS 15", category: "Laptops", price: 179990, originalPrice: 199990, rating: 4.6, reviews: 654, image: "💻", badge: null, specs: ["Intel i9", "32GB RAM", "1TB SSD", "RTX 4070"], brand: "Dell" },
  { id: 6, name: "iPad Pro 12.9\"", category: "Tablets", price: 109900, originalPrice: 119900, rating: 4.8, reviews: 1234, image: "📲", badge: "HOT", specs: ["M2 Chip", "8GB RAM", "256GB", "120Hz"], brand: "Apple" },
  { id: 7, name: "LG OLED 65\" 4K TV", category: "TVs", price: 149999, originalPrice: 179999, rating: 4.7, reviews: 432, image: "📺", badge: "SALE", specs: ["65\"", "4K OLED", "120Hz", "Dolby Vision"], brand: "LG" },
  { id: 8, name: "Sony PS5", category: "Gaming", price: 54990, originalPrice: 59990, rating: 4.9, reviews: 8765, image: "🎮", badge: "BESTSELLER", specs: ["4K", "120fps", "825GB SSD", "Ray Tracing"], brand: "Sony" },
  { id: 9, name: "Canon EOS R6 Mark II", category: "Cameras", price: 239990, originalPrice: 259990, rating: 4.8, reviews: 345, image: "📷", badge: "NEW", specs: ["24.2MP", "4K Video", "IBIS", "Dual Pixel AF"], brand: "Canon" },
  { id: 10, name: "Apple Watch Ultra 2", category: "Wearables", price: 89900, originalPrice: 99900, rating: 4.7, reviews: 1543, image: "⌚", badge: "HOT", specs: ["49mm", "GPS+LTE", "60hr Battery", "Titanium"], brand: "Apple" },
  { id: 11, name: "OnePlus 12", category: "Mobiles", price: 64999, originalPrice: 69999, rating: 4.6, reviews: 2100, image: "📱", badge: "SALE", specs: ["16GB RAM", "512GB", "50MP", "100W Charge"], brand: "OnePlus" },
  { id: 12, name: "JBL Charge 5", category: "Audio", price: 14999, originalPrice: 17999, rating: 4.5, reviews: 3421, image: "🔊", badge: null, specs: ["20hr Battery", "IP67", "Powerbank", "Stereo"], brand: "JBL" },
];

const CATEGORIES = ["All", "Mobiles", "Laptops", "Tablets", "TVs", "Gaming", "Cameras", "Audio", "Wearables"];

// ─── Custom Hooks ─────────────────────────────────────────────────────────────
function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    try { return JSON.parse(localStorage.getItem(key)) ?? initial; }
    catch { return initial; }
  });
  useEffect(() => { localStorage.setItem(key, JSON.stringify(value)); }, [key, value]);
  return [value, setValue];
}

function useCountdown(seconds, onExpire) {
  const [remaining, setRemaining] = useState(seconds);
  const [active, setActive] = useState(false);
  const intervalRef = useRef(null);

  const start = useCallback(() => { setRemaining(seconds); setActive(true); }, [seconds]);
  const reset = useCallback(() => { setActive(false); setRemaining(seconds); clearInterval(intervalRef.current); }, [seconds]);

  useEffect(() => {
    if (!active) return;
    intervalRef.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) { clearInterval(intervalRef.current); setActive(false); onExpire?.(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [active, onExpire]);

  const mins = String(Math.floor(remaining / 60)).padStart(2, "0");
  const secs = String(remaining % 60).padStart(2, "0");
  return { remaining, active, start, reset, display: `${mins}:${secs}` };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = n => "₹" + n.toLocaleString("en-IN");
const discount = (orig, curr) => Math.round(((orig - curr) / orig) * 100);

// ─── Components ──────────────────────────────────────────────────────────────

function StarRating({ rating }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ color: i <= Math.round(rating) ? "#FFD700" : "#444", fontSize: 12 }}>★</span>
      ))}
      <span style={{ color: "#aaa", fontSize: 11, marginLeft: 2 }}>{rating}</span>
    </div>
  );
}

function Toast({ message, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 2500); return () => clearTimeout(t); }, [onClose]);
  return (
    <div style={{
      position: "fixed", bottom: 30, left: "50%", transform: "translateX(-50%)",
      background: "#00FF88", color: "#0a0a0a", padding: "12px 28px", borderRadius: 50,
      fontWeight: 700, fontSize: 14, zIndex: 9999, boxShadow: "0 8px 32px rgba(0,255,136,0.4)",
      animation: "slideUp 0.3s ease", letterSpacing: 0.5
    }}>
      {message}
    </div>
  );
}

function ProductCard({ product, onAddToCart, onView, wishlist, onToggleWishlist }) {
  const [hovered, setHovered] = useState(false);
  const isWished = wishlist.includes(product.id);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? "#1a1a2e" : "#111827",
        border: `1px solid ${hovered ? "#00FF88" : "#1f2937"}`,
        borderRadius: 16, overflow: "hidden", cursor: "pointer",
        transition: "all 0.3s ease", transform: hovered ? "translateY(-6px)" : "none",
        boxShadow: hovered ? "0 20px 60px rgba(0,255,136,0.15)" : "0 2px 12px rgba(0,0,0,0.3)",
        position: "relative"
      }}
    >
      {product.badge && (
        <div style={{
          position: "absolute", top: 12, left: 12, zIndex: 2,
          background: product.badge === "SALE" ? "#FF4D6D" : product.badge === "NEW" ? "#7C3AED" : product.badge === "BESTSELLER" ? "#F59E0B" : "#00FF88",
          color: product.badge === "BESTSELLER" ? "#000" : "#fff",
          fontSize: 10, fontWeight: 800, padding: "3px 8px", borderRadius: 4, letterSpacing: 1
        }}>{product.badge}</div>
      )}
      <button
        onClick={e => { e.stopPropagation(); onToggleWishlist(product.id); }}
        style={{
          position: "absolute", top: 10, right: 12, zIndex: 2, background: "none", border: "none",
          fontSize: 20, cursor: "pointer", color: isWished ? "#FF4D6D" : "#555", transition: "all 0.2s"
        }}
      >{isWished ? "❤️" : "🤍"}</button>

      <div
        onClick={() => onView(product)}
        style={{ height: 160, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 72, background: "linear-gradient(135deg, #0f172a, #1e293b)" }}
      >{product.image}</div>

      <div style={{ padding: "16px" }}>
        <div style={{ color: "#6B7280", fontSize: 11, marginBottom: 4, letterSpacing: 1, textTransform: "uppercase" }}>{product.brand} • {product.category}</div>
        <div style={{ color: "#F9FAFB", fontWeight: 700, fontSize: 14, lineHeight: 1.4, marginBottom: 8, height: 40, overflow: "hidden" }}>{product.name}</div>
        <StarRating rating={product.rating} />
        <div style={{ color: "#6B7280", fontSize: 11, marginTop: 2, marginBottom: 10 }}>({product.reviews.toLocaleString()} reviews)</div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 12 }}>
          {product.specs.slice(0, 3).map(s => (
            <span key={s} style={{ background: "#1f2937", color: "#9CA3AF", fontSize: 10, padding: "2px 7px", borderRadius: 20 }}>{s}</span>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 14 }}>
          <span style={{ color: "#00FF88", fontWeight: 800, fontSize: 18 }}>{fmt(product.price)}</span>
          <span style={{ color: "#6B7280", fontSize: 12, textDecoration: "line-through" }}>{fmt(product.originalPrice)}</span>
          <span style={{ background: "#1a4731", color: "#00FF88", fontSize: 11, padding: "2px 6px", borderRadius: 4, fontWeight: 700 }}>
            {discount(product.originalPrice, product.price)}% OFF
          </span>
        </div>

        <button
          onClick={() => onAddToCart(product)}
          style={{
            width: "100%", padding: "10px", background: hovered ? "#00FF88" : "#0f2b1a",
            color: hovered ? "#0a0a0a" : "#00FF88", border: `1px solid #00FF88`,
            borderRadius: 8, fontWeight: 700, cursor: "pointer", fontSize: 13,
            transition: "all 0.2s", letterSpacing: 0.5
          }}
        >+ Add to Cart</button>
      </div>
    </div>
  );
}

function CartSidebar({ cart, dispatch, onCheckout, onClose }) {
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const savings = cart.reduce((s, i) => s + (i.originalPrice - i.price) * i.qty, 0);

  return (
    <div style={{
      position: "fixed", right: 0, top: 0, bottom: 0, width: 380, background: "#0d1117",
      borderLeft: "1px solid #1f2937", zIndex: 1000, display: "flex", flexDirection: "column",
      boxShadow: "-20px 0 60px rgba(0,0,0,0.6)"
    }}>
      <div style={{ padding: "20px 24px", borderBottom: "1px solid #1f2937", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ color: "#F9FAFB", fontWeight: 800, fontSize: 18 }}>🛒 Cart ({cart.length})</span>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "#9CA3AF", fontSize: 24, cursor: "pointer" }}>✕</button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px" }}>
        {cart.length === 0 ? (
          <div style={{ textAlign: "center", color: "#6B7280", marginTop: 60 }}>
            <div style={{ fontSize: 60 }}>🛒</div>
            <div style={{ marginTop: 12 }}>Your cart is empty</div>
          </div>
        ) : (
          cart.map(item => (
            <div key={item.id} style={{ display: "flex", gap: 12, marginBottom: 16, padding: 12, background: "#111827", borderRadius: 12 }}>
              <div style={{ fontSize: 36 }}>{item.image}</div>
              <div style={{ flex: 1 }}>
                <div style={{ color: "#F9FAFB", fontSize: 13, fontWeight: 600, lineHeight: 1.3 }}>{item.name}</div>
                <div style={{ color: "#00FF88", fontWeight: 700, fontSize: 14, margin: "4px 0" }}>{fmt(item.price)}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <button onClick={() => dispatch({ type: "DECREMENT", id: item.id })}
                    style={{ width: 26, height: 26, borderRadius: 6, border: "1px solid #374151", background: "#1f2937", color: "#fff", cursor: "pointer" }}>−</button>
                  <span style={{ color: "#fff", fontWeight: 700 }}>{item.qty}</span>
                  <button onClick={() => dispatch({ type: "INCREMENT", id: item.id })}
                    style={{ width: 26, height: 26, borderRadius: 6, border: "1px solid #374151", background: "#1f2937", color: "#fff", cursor: "pointer" }}>+</button>
                  <button onClick={() => dispatch({ type: "REMOVE", id: item.id })}
                    style={{ marginLeft: "auto", background: "none", border: "none", color: "#FF4D6D", cursor: "pointer", fontSize: 14 }}>🗑️</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {cart.length > 0 && (
        <div style={{ padding: "16px 24px", borderTop: "1px solid #1f2937" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ color: "#9CA3AF" }}>Subtotal</span>
            <span style={{ color: "#F9FAFB" }}>{fmt(total)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
            <span style={{ color: "#9CA3AF" }}>You save</span>
            <span style={{ color: "#00FF88", fontWeight: 700 }}>{fmt(savings)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16, padding: "12px 0", borderTop: "1px solid #1f2937" }}>
            <span style={{ color: "#F9FAFB", fontWeight: 700, fontSize: 16 }}>Total</span>
            <span style={{ color: "#00FF88", fontWeight: 800, fontSize: 18 }}>{fmt(total)}</span>
          </div>
          <button onClick={onCheckout} style={{
            width: "100%", padding: 14, background: "linear-gradient(135deg, #00FF88, #00CC6A)",
            color: "#0a0a0a", border: "none", borderRadius: 10, fontWeight: 800, fontSize: 15,
            cursor: "pointer", letterSpacing: 0.5
          }}>Proceed to Checkout →</button>
        </div>
      )}
    </div>
  );
}

function ProductModal({ product, onClose, onAddToCart }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
      onClick={onClose}>
      <div style={{ background: "#111827", borderRadius: 20, width: "100%", maxWidth: 640, maxHeight: "90vh", overflowY: "auto", padding: 32, border: "1px solid #1f2937" }}
        onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
          <div style={{ fontSize: 80 }}>{product.image}</div>
          <button onClick={onClose} style={{ background: "#1f2937", border: "none", color: "#9CA3AF", fontSize: 20, width: 36, height: 36, borderRadius: 8, cursor: "pointer" }}>✕</button>
        </div>
        <div style={{ color: "#9CA3AF", fontSize: 12, marginBottom: 6, letterSpacing: 1 }}>{product.brand} • {product.category}</div>
        <h2 style={{ color: "#F9FAFB", fontSize: 22, fontWeight: 800, marginBottom: 12 }}>{product.name}</h2>
        <StarRating rating={product.rating} />
        <div style={{ color: "#6B7280", fontSize: 13, marginTop: 4, marginBottom: 20 }}>{product.reviews.toLocaleString()} verified reviews</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
          {product.specs.map(s => (
            <span key={s} style={{ background: "#1f2937", color: "#9CA3AF", padding: "6px 14px", borderRadius: 20, fontSize: 12 }}>{s}</span>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 24 }}>
          <span style={{ color: "#00FF88", fontWeight: 800, fontSize: 28 }}>{fmt(product.price)}</span>
          <span style={{ color: "#6B7280", fontSize: 16, textDecoration: "line-through" }}>{fmt(product.originalPrice)}</span>
          <span style={{ background: "#1a4731", color: "#00FF88", padding: "4px 10px", borderRadius: 6, fontWeight: 700 }}>
            {discount(product.originalPrice, product.price)}% OFF
          </span>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={() => { onAddToCart(product); onClose(); }} style={{
            flex: 1, padding: 14, background: "#00FF88", color: "#0a0a0a",
            border: "none", borderRadius: 10, fontWeight: 800, fontSize: 15, cursor: "pointer"
          }}>Add to Cart</button>
          <button onClick={() => { onAddToCart(product); onClose(); }} style={{
            flex: 1, padding: 14, background: "linear-gradient(135deg, #7C3AED, #5B21B6)",
            color: "#fff", border: "none", borderRadius: 10, fontWeight: 800, fontSize: 15, cursor: "pointer"
          }}>Buy Now</button>
        </div>
      </div>
    </div>
  );
}

function CheckoutModal({ cart, dispatch, onClose }) {
  const [step, setStep] = useState(1); // 1: details, 2: payment, 3: success
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", city: "", pincode: "", payMethod: "upi" });
  const [errors, setErrors] = useState({});
  const [processing, setProcessing] = useState(false);
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

  const onExpire = useCallback(() => alert("Session expired! Please restart checkout."), []);
  const timer = useCountdown(600, onExpire); // 10 min timer

  useEffect(() => { if (step === 2) timer.start(); }, [step]);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Required";
    if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Invalid email";
    if (!/^\d{10}$/.test(form.phone)) e.phone = "10 digit mobile";
    if (!form.address.trim()) e.address = "Required";
    if (!form.city.trim()) e.city = "Required";
    if (!/^\d{6}$/.test(form.pincode)) e.pincode = "6 digit PIN";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePay = () => {
    if (!validate()) return;
    setStep(2);
  };

  const handleConfirm = () => {
    setProcessing(true);
    setTimeout(() => { setProcessing(false); setStep(3); dispatch({ type: "CLEAR" }); timer.reset(); }, 2500);
  };

  const field = (label, key, type = "text", placeholder = "") => (
    <div style={{ marginBottom: 16 }}>
      <label style={{ color: "#9CA3AF", fontSize: 12, display: "block", marginBottom: 5 }}>{label}</label>
      <input
        type={type} value={form[key]} placeholder={placeholder}
        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
        style={{
          width: "100%", padding: "10px 14px", background: "#1f2937", border: `1px solid ${errors[key] ? "#FF4D6D" : "#374151"}`,
          borderRadius: 8, color: "#F9FAFB", fontSize: 14, outline: "none", boxSizing: "border-box"
        }}
      />
      {errors[key] && <span style={{ color: "#FF4D6D", fontSize: 11 }}>{errors[key]}</span>}
    </div>
  );

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 3000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "#0d1117", borderRadius: 20, width: "100%", maxWidth: 540, maxHeight: "92vh", overflowY: "auto", border: "1px solid #1f2937" }}>

        {/* Header */}
        <div style={{ padding: "20px 28px", borderBottom: "1px solid #1f2937", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ color: "#F9FAFB", fontWeight: 800, fontSize: 18 }}>
            {step === 1 ? "📦 Shipping Details" : step === 2 ? "💳 Payment" : "✅ Order Confirmed"}
          </span>
          {step < 3 && <button onClick={onClose} style={{ background: "none", border: "none", color: "#9CA3AF", fontSize: 22, cursor: "pointer" }}>✕</button>}
        </div>

        {/* Progress */}
        {step < 3 && (
          <div style={{ padding: "16px 28px 0", display: "flex", gap: 8 }}>
            {["Details", "Payment"].map((s, i) => (
              <div key={s} style={{ flex: 1, height: 4, borderRadius: 4, background: step > i ? "#00FF88" : "#1f2937", transition: "all 0.4s" }} />
            ))}
          </div>
        )}

        <div style={{ padding: "24px 28px" }}>
          {step === 1 && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
                {field("Full Name *", "name", "text", "Rahul Sharma")}
                {field("Email *", "email", "email", "rahul@gmail.com")}
                {field("Phone *", "phone", "tel", "9876543210")}
              </div>
              {field("Address *", "address", "text", "House No, Street, Locality")}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
                {field("City *", "city", "text", "Mumbai")}
                {field("PIN Code *", "pincode", "text", "400001")}
              </div>

              {/* Order Summary */}
              <div style={{ background: "#111827", borderRadius: 12, padding: 16, marginBottom: 20 }}>
                <div style={{ color: "#9CA3AF", fontSize: 12, marginBottom: 10, fontWeight: 700 }}>ORDER SUMMARY</div>
                {cart.map(i => (
                  <div key={i.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ color: "#9CA3AF", fontSize: 13 }}>{i.name} ×{i.qty}</span>
                    <span style={{ color: "#F9FAFB", fontSize: 13, fontWeight: 600 }}>{fmt(i.price * i.qty)}</span>
                  </div>
                ))}
                <div style={{ borderTop: "1px solid #1f2937", marginTop: 10, paddingTop: 10, display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#F9FAFB", fontWeight: 700 }}>Total</span>
                  <span style={{ color: "#00FF88", fontWeight: 800, fontSize: 16 }}>{fmt(total)}</span>
                </div>
              </div>

              <button onClick={handlePay} style={{
                width: "100%", padding: 14, background: "linear-gradient(135deg, #00FF88, #00CC6A)",
                color: "#0a0a0a", border: "none", borderRadius: 10, fontWeight: 800, fontSize: 15, cursor: "pointer"
              }}>Proceed to Payment →</button>
            </>
          )}

          {step === 2 && (
            <>
              {/* Timer */}
              <div style={{
                background: timer.remaining < 60 ? "#2d1a1a" : "#1a2d1a",
                border: `1px solid ${timer.remaining < 60 ? "#FF4D6D" : "#00FF88"}`,
                borderRadius: 12, padding: "12px 16px", marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center"
              }}>
                <span style={{ color: "#9CA3AF", fontSize: 13 }}>⏱ Session expires in</span>
                <span style={{ color: timer.remaining < 60 ? "#FF4D6D" : "#00FF88", fontWeight: 800, fontSize: 20, fontFamily: "monospace" }}>{timer.display}</span>
              </div>

              {/* Payment Methods */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ color: "#9CA3AF", fontSize: 12, marginBottom: 12, fontWeight: 700 }}>SELECT PAYMENT METHOD</div>
                {[
                  { id: "upi", label: "UPI", icon: "📲", sub: "GPay, PhonePe, Paytm" },
                  { id: "card", label: "Credit / Debit Card", icon: "💳", sub: "Visa, Mastercard, RuPay" },
                  { id: "netbanking", label: "Net Banking", icon: "🏦", sub: "All major banks" },
                  { id: "emi", label: "EMI", icon: "📅", sub: "0% EMI available" },
                  { id: "cod", label: "Cash on Delivery", icon: "💰", sub: "Available in your area" },
                ].map(pm => (
                  <div key={pm.id}
                    onClick={() => setForm(f => ({ ...f, payMethod: pm.id }))}
                    style={{
                      border: `1px solid ${form.payMethod === pm.id ? "#00FF88" : "#1f2937"}`,
                      background: form.payMethod === pm.id ? "#0f2b1a" : "#111827",
                      borderRadius: 10, padding: "12px 16px", marginBottom: 8, cursor: "pointer",
                      display: "flex", alignItems: "center", gap: 12, transition: "all 0.2s"
                    }}>
                    <span style={{ fontSize: 22 }}>{pm.icon}</span>
                    <div>
                      <div style={{ color: "#F9FAFB", fontWeight: 600, fontSize: 14 }}>{pm.label}</div>
                      <div style={{ color: "#6B7280", fontSize: 12 }}>{pm.sub}</div>
                    </div>
                    <div style={{ marginLeft: "auto", width: 18, height: 18, borderRadius: "50%", border: `2px solid ${form.payMethod === pm.id ? "#00FF88" : "#374151"}`, background: form.payMethod === pm.id ? "#00FF88" : "none", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {form.payMethod === pm.id && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#0a0a0a" }} />}
                    </div>
                  </div>
                ))}
              </div>

              {form.payMethod === "upi" && (
                <div style={{ marginBottom: 20 }}>
                  {field("UPI ID", "upiId", "text", "yourname@upi")}
                </div>
              )}

              {form.payMethod === "card" && (
                <div style={{ marginBottom: 20 }}>
                  {field("Card Number", "cardNum", "text", "1234 5678 9012 3456")}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
                    {field("Expiry", "expiry", "text", "MM/YY")}
                    {field("CVV", "cvv", "text", "•••")}
                  </div>
                </div>
              )}

              <div style={{ background: "#111827", borderRadius: 12, padding: "14px 16px", marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#9CA3AF" }}>Amount to Pay</span>
                <span style={{ color: "#00FF88", fontWeight: 800, fontSize: 22 }}>{fmt(total)}</span>
              </div>

              <button onClick={handleConfirm} disabled={processing} style={{
                width: "100%", padding: 14,
                background: processing ? "#1f2937" : "linear-gradient(135deg, #7C3AED, #5B21B6)",
                color: processing ? "#6B7280" : "#fff", border: "none", borderRadius: 10,
                fontWeight: 800, fontSize: 15, cursor: processing ? "not-allowed" : "pointer"
              }}>
                {processing ? "⏳ Processing Payment..." : `🔒 Pay ${fmt(total)} Securely`}
              </button>
            </>
          )}

          {step === 3 && (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ fontSize: 80, marginBottom: 16 }}>🎉</div>
              <h2 style={{ color: "#00FF88", fontSize: 26, fontWeight: 800, marginBottom: 8 }}>Order Placed!</h2>
              <p style={{ color: "#9CA3AF", marginBottom: 6 }}>Thank you, {form.name}!</p>
              <p style={{ color: "#6B7280", fontSize: 14, marginBottom: 20 }}>Confirmation sent to {form.email}</p>
              <div style={{ background: "#111827", borderRadius: 12, padding: 16, marginBottom: 24, textAlign: "left" }}>
                <div style={{ color: "#9CA3AF", fontSize: 12, marginBottom: 8, fontWeight: 700 }}>ORDER DETAILS</div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ color: "#9CA3AF" }}>Order ID</span>
                  <span style={{ color: "#F9FAFB", fontFamily: "monospace" }}>#TG{Date.now().toString().slice(-8)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ color: "#9CA3AF" }}>Amount Paid</span>
                  <span style={{ color: "#00FF88", fontWeight: 700 }}>{fmt(total)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#9CA3AF" }}>Estimated Delivery</span>
                  <span style={{ color: "#F9FAFB" }}>3-5 Business Days</span>
                </div>
              </div>
              <button onClick={onClose} style={{
                padding: "12px 40px", background: "#00FF88", color: "#0a0a0a",
                border: "none", borderRadius: 10, fontWeight: 800, fontSize: 15, cursor: "pointer"
              }}>Continue Shopping</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [cart, dispatch] = useReducer(cartReducer, []);
  const [wishlist, setWishlist] = useLocalStorage("wishlist", []);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sortBy, setSortBy] = useState("popular");
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [viewProduct, setViewProduct] = useState(null);
  const [toast, setToast] = useState(null);
  const [priceRange, setPriceRange] = useState([0, 300000]);

  const debouncedSearch = useDebounce(search, 300);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  const addToCart = useCallback((product) => {
    dispatch({ type: "ADD", item: product });
    setToast(`${product.name} added to cart!`);
  }, []);

  const toggleWishlist = useCallback((id) => {
    setWishlist(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }, [setWishlist]);

  const filtered = PRODUCTS
    .filter(p => category === "All" || p.category === category)
    .filter(p => p.name.toLowerCase().includes(debouncedSearch.toLowerCase()) || p.brand.toLowerCase().includes(debouncedSearch.toLowerCase()))
    .filter(p => p.price >= priceRange[0] && p.price <= priceRange[1])
    .sort((a, b) => {
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      if (sortBy === "rating") return b.rating - a.rating;
      return b.reviews - a.reviews;
    });

  return (
    <CartContext.Provider value={{ cart, dispatch }}>
      <div style={{ minHeight: "100vh", background: "#0a0a0a", fontFamily: "'Poppins', sans-serif", color: "#F9FAFB" }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Poppins', sans-serif; }
          ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: #0d1117; } ::-webkit-scrollbar-thumb { background: #1f2937; border-radius: 3px; }
          @keyframes slideUp { from { transform: translateX(-50%) translateY(20px); opacity: 0; } to { transform: translateX(-50%) translateY(0); opacity: 1; } }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
          input:focus { outline: 2px solid #00FF88 !important; border-color: #00FF88 !important; }
        `}</style>

        {/* Navbar */}
        <nav style={{
          position: "sticky", top: 0, zIndex: 500, background: "rgba(10,10,10,0.95)",
          backdropFilter: "blur(20px)", borderBottom: "1px solid #1f2937",
          padding: "0 24px", height: 64, display: "flex", alignItems: "center", gap: 20
        }}>
          <div style={{ fontWeight: 800, fontSize: 22, color: "#00FF88", letterSpacing: -1, whiteSpace: "nowrap" }}>
            ⚡ TechGalaxy
          </div>

          <div style={{ flex: 1, maxWidth: 480, position: "relative" }}>
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search phones, laptops, TVs..."
              style={{
                width: "100%", padding: "9px 16px 9px 42px", background: "#111827",
                border: "1px solid #1f2937", borderRadius: 10, color: "#F9FAFB",
                fontSize: 14, outline: "none"
              }}
            />
            <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#6B7280" }}>🔍</span>
          </div>

          <div style={{ marginLeft: "auto", display: "flex", gap: 12, alignItems: "center" }}>
            <button style={{ background: "none", border: "none", color: "#9CA3AF", cursor: "pointer", fontSize: 22 }}>👤</button>
            <button
              onClick={() => setShowCart(true)}
              style={{ position: "relative", background: "#111827", border: "1px solid #1f2937", borderRadius: 10, color: "#F9FAFB", cursor: "pointer", padding: "8px 16px", fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}
            >
              🛒 Cart
              {cartCount > 0 && (
                <span style={{ background: "#00FF88", color: "#0a0a0a", borderRadius: "50%", width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800 }}>{cartCount}</span>
              )}
            </button>
          </div>
        </nav>

        {/* Hero Banner */}
        <div style={{
          background: "linear-gradient(135deg, #0d1117 0%, #0f2b1a 50%, #0d1117 100%)",
          padding: "48px 24px", textAlign: "center", borderBottom: "1px solid #1f2937", position: "relative", overflow: "hidden"
        }}>
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 0%, rgba(0,255,136,0.08) 0%, transparent 70%)" }} />
          <div style={{ position: "relative" }}>
            <div style={{ display: "inline-block", background: "#0f2b1a", border: "1px solid #00FF88", color: "#00FF88", fontSize: 12, padding: "5px 14px", borderRadius: 20, marginBottom: 16, fontWeight: 700, letterSpacing: 2 }}>
              🔥 REPUBLIC DAY MEGA SALE — UP TO 40% OFF
            </div>
            <h1 style={{ fontSize: "clamp(28px, 5vw, 52px)", fontWeight: 800, letterSpacing: -2, lineHeight: 1.1, marginBottom: 16 }}>
              The Future of <span style={{ color: "#00FF88" }}>Electronics</span>
            </h1>
            <p style={{ color: "#6B7280", fontSize: 16, marginBottom: 24 }}>Premium devices at unbeatable prices • Free delivery above ₹999 • Easy returns</p>
            <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
              {[["📱", "12K+ Mobiles"], ["💻", "5K+ Laptops"], ["📺", "3K+ TVs"], ["🎮", "8K+ Gaming"]].map(([ic, lb]) => (
                <div key={lb} style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 10, padding: "10px 20px", display: "flex", gap: 8, alignItems: "center" }}>
                  <span>{ic}</span><span style={{ color: "#9CA3AF", fontSize: 13 }}>{lb}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div style={{ padding: "16px 24px", background: "#0d1117", borderBottom: "1px solid #1f2937", display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", flex: 1 }}>
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setCategory(cat)} style={{
                padding: "7px 16px", borderRadius: 20, border: `1px solid ${category === cat ? "#00FF88" : "#1f2937"}`,
                background: category === cat ? "#0f2b1a" : "transparent", color: category === cat ? "#00FF88" : "#9CA3AF",
                cursor: "pointer", fontSize: 13, fontWeight: 600, transition: "all 0.2s"
              }}>{cat}</button>
            ))}
          </div>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}
            style={{ padding: "7px 14px", background: "#111827", border: "1px solid #1f2937", borderRadius: 8, color: "#9CA3AF", fontSize: 13, cursor: "pointer" }}>
            <option value="popular">Most Popular</option>
            <option value="price-asc">Price: Low → High</option>
            <option value="price-desc">Price: High → Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>

        {/* Products Grid */}
        <div style={{ padding: "24px", maxWidth: 1400, margin: "0 auto" }}>
          <div style={{ color: "#6B7280", fontSize: 13, marginBottom: 20 }}>
            Showing {filtered.length} products {category !== "All" && `in ${category}`}
          </div>
          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 0", color: "#6B7280" }}>
              <div style={{ fontSize: 64 }}>🔍</div>
              <div style={{ marginTop: 16, fontSize: 18 }}>No products found</div>
              <button onClick={() => { setSearch(""); setCategory("All"); }} style={{ marginTop: 12, padding: "10px 24px", background: "#00FF88", color: "#0a0a0a", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>Clear Filters</button>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 20 }}>
              {filtered.map(p => (
                <ProductCard key={p.id} product={p} onAddToCart={addToCart} onView={setViewProduct} wishlist={wishlist} onToggleWishlist={toggleWishlist} />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <footer style={{ background: "#0d1117", borderTop: "1px solid #1f2937", padding: "32px 24px", textAlign: "center" }}>
          <div style={{ color: "#00FF88", fontWeight: 800, fontSize: 18, marginBottom: 8 }}>⚡ TechGalaxy</div>
          <p style={{ color: "#6B7280", fontSize: 13 }}>© 2025 TechGalaxy Electronics • All prices in Indian Rupees (₹) • GST Included</p>
          <div style={{ display: "flex", justifyContent: "center", gap: 24, marginTop: 16, flexWrap: "wrap" }}>
            {["Free Delivery ₹999+", "Easy 15-day Returns", "Secure Payments", "24/7 Support"].map(t => (
              <span key={t} style={{ color: "#4B5563", fontSize: 12 }}>✓ {t}</span>
            ))}
          </div>
        </footer>

        {/* Overlays */}
        {showCart && <CartSidebar cart={cart} dispatch={dispatch} onCheckout={() => { setShowCart(false); setShowCheckout(true); }} onClose={() => setShowCart(false)} />}
        {showCart && <div onClick={() => setShowCart(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 999 }} />}
        {showCheckout && <CheckoutModal cart={cart} dispatch={dispatch} onClose={() => setShowCheckout(false)} />}
        {viewProduct && <ProductModal product={viewProduct} onClose={() => setViewProduct(null)} onAddToCart={addToCart} />}
        {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      </div>
    </CartContext.Provider>
  );
}