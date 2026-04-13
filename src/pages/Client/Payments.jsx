// src/pages/Client/BillingPayments.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, CreditCard, Wallet, DollarSign, Calendar,
  Plus, Trash2, Check, X, AlertCircle,
  Download, Clock, Shield, RefreshCw,
  ChevronRight, TrendingUp, TrendingDown, Lock,
  Building
} from "lucide-react";
import "../Client/css/payments.css";

// Mock data
const MOCK_BALANCE = {
  available: 12500,
  pending: 2500,
  total_spent: 48500,
  total_earned: 0
};

const MOCK_PAYMENT_METHODS = [
  {
    id: 1,
    type: "card",
    brand: "Visa",
    last4: "4242",
    expiry: "12/2026",
    isDefault: true,
    cardholderName: "John Doe"
  },
  {
    id: 2,
    type: "card",
    brand: "Mastercard",
    last4: "5555",
    expiry: "08/2025",
    isDefault: false,
    cardholderName: "John Doe"
  },
  {
    id: 3,
    type: "bank",
    bankName: "Uzcard",
    accountName: "John Doe",
    accountNumber: "****1234",
    isDefault: false
  }
];

const MOCK_TRANSACTIONS = [
  {
    id: 1,
    type: "payment",
    description: "To'lov - Full-Stack Developer",
    amount: -3500,
    date: "2024-01-15",
    status: "completed",
    reference: "JOB-12345"
  },
  {
    id: 2,
    type: "deposit",
    description: "Hisobni to'ldirish",
    amount: 5000,
    date: "2024-01-10",
    status: "completed",
    reference: "DEP-001"
  },
  {
    id: 3,
    type: "payment",
    description: "To'lov - UI/UX Designer",
    amount: -2800,
    date: "2024-01-05",
    status: "completed",
    reference: "JOB-12346"
  },
  {
    id: 4,
    type: "refund",
    description: "Qaytarilgan to'lov - Mobile App",
    amount: 1200,
    date: "2024-01-02",
    status: "completed",
    reference: "REF-001"
  },
  {
    id: 5,
    type: "payment",
    description: "To'lov - DevOps Engineer",
    amount: -4500,
    date: "2023-12-28",
    status: "pending",
    reference: "JOB-12347"
  },
  {
    id: 6,
    type: "fee",
    description: "Platforma komissiyasi",
    amount: -350,
    date: "2024-01-15",
    status: "completed",
    reference: "FEE-001"
  }
];

const BillingPayments = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  
  const [balance] = useState(MOCK_BALANCE);
  const [paymentMethods, setPaymentMethods] = useState(MOCK_PAYMENT_METHODS);
  const [transactions] = useState(MOCK_TRANSACTIONS);
  
  const [showAddCard, setShowAddCard] = useState(false);
  const [showAddBank, setShowAddBank] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const [newCard, setNewCard] = useState({
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: ""
  });

  const [newBank, setNewBank] = useState({
    bankName: "",
    accountName: "",
    accountNumber: "",
    routingNumber: ""
  });

  const [nextId, setNextId] = useState(100);

  const handleAddCard = async () => {
    try {
      const newId = nextId + 1;
      setNextId(newId);
      setPaymentMethods([
        ...paymentMethods,
        {
          id: newId,
          type: "card",
          brand: "Visa",
          last4: newCard.cardNumber.slice(-4),
          expiry: newCard.expiryDate,
          isDefault: false,
          cardholderName: newCard.cardName
        }
      ]);
      setShowAddCard(false);
      setNewCard({ cardNumber: "", cardName: "", expiryDate: "", cvv: "" });
      showToast("Karta muvaffaqiyatli qo'shildi!");
    } catch (error) {
      console.error("Error adding card:", error);
    }
  };

  const handleAddBank = async () => {
    try {
      const newId = nextId + 2;
      setNextId(newId);
      setPaymentMethods([
        ...paymentMethods,
        {
          id: newId,
          type: "bank",
          bankName: newBank.bankName,
          accountName: newBank.accountName,
          accountNumber: "****" + newBank.accountNumber.slice(-4),
          isDefault: false
        }
      ]);
      setShowAddBank(false);
      setNewBank({ bankName: "", accountName: "", accountNumber: "", routingNumber: "" });
      showToast("Bank hisobi muvaffaqiyatli qo'shildi!");
    } catch (error) {
      console.error("Error adding bank:", error);
    }
  };

  const handleSetDefault = async (id) => {
    try {
      setPaymentMethods(paymentMethods.map(method => ({
        ...method,
        isDefault: method.id === id
      })));
      showToast("Asosiy to'lov usuli o'zgartirildi!");
    } catch (error) {
      console.error("Error setting default:", error);
    }
  };

  const handleDeleteMethod = async (id) => {
    try {
      setPaymentMethods(paymentMethods.filter(method => method.id !== id));
      showToast("To'lov usuli o'chirildi!");
    } catch (error) {
      console.error("Error deleting method:", error);
    }
  };

  const handleWithdraw = async () => {
    try {
      console.log("Withdrawing:", withdrawAmount, "to:", selectedMethod);
      setShowWithdrawModal(false);
      setWithdrawAmount("");
      showToast("Pul yechish so'rovi yuborildi! (1-3 ish kunida hisobingizga tushadi)");
    } catch (error) {
      console.error("Error withdrawing:", error);
    }
  };

  const showToast = (message) => {
    setToastMessage(message);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(Math.abs(amount));
  };

  const getTransactionIcon = (type) => {
    switch(type) {
      case "payment": return <TrendingDown size={18} className="bp-icon-payment" />;
      case "deposit": return <TrendingUp size={18} className="bp-icon-deposit" />;
      case "refund": return <RefreshCw size={18} className="bp-icon-refund" />;
      case "fee": return <Shield size={18} className="bp-icon-fee" />;
      default: return <DollarSign size={18} />;
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case "completed":
        return <span className="bp-status-badge bp-completed"><Check size={12} /> Bajarilgan</span>;
      case "pending":
        return <span className="bp-status-badge bp-pending"><Clock size={12} /> Kutilmoqda</span>;
      case "failed":
        return <span className="bp-status-badge bp-failed"><X size={12} /> Muvaffaqiyatsiz</span>;
      default:
        return null;
    }
  };

  return (
    <div className="bp-page">
      <div className="bp-container">
        {/* Header */}
        <div className="bp-header">
          <button className="bp-back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={18} /> Orqaga
          </button>
          <h1>To'lovlar va hisob-kitob</h1>
        </div>

        {/* Tabs */}
        <div className="bp-tabs">
          <button
            className={`bp-tab-btn ${activeTab === "overview" ? "bp-active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            <Wallet size={16} /> Umumiy
          </button>
          <button
            className={`bp-tab-btn ${activeTab === "methods" ? "bp-active" : ""}`}
            onClick={() => setActiveTab("methods")}
          >
            <CreditCard size={16} /> To'lov usullari
          </button>
          <button
            className={`bp-tab-btn ${activeTab === "transactions" ? "bp-active" : ""}`}
            onClick={() => setActiveTab("transactions")}
          >
            <Clock size={16} /> Tranzaksiyalar
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <>
            <div className="bp-balance-cards">
              <div className="bp-balance-card bp-available">
                <div className="bp-balance-header">
                  <span className="bp-balance-label">Mavjud balans</span>
                  <span className="bp-balance-sub">Yechib olish mumkin</span>
                </div>
                <div className="bp-balance-amount">${balance.available.toLocaleString()}</div>
                <button 
                  className="bp-withdraw-btn"
                  onClick={() => setShowWithdrawModal(true)}
                >
                  Pul yechish
                </button>
              </div>

              <div className="bp-balance-card bp-pending">
                <div className="bp-balance-header">
                  <span className="bp-balance-label">Kutilayotgan to'lovlar</span>
                  <span className="bp-balance-sub">Tasdiqlanishi kutilmoqda</span>
                </div>
                <div className="bp-balance-amount">${balance.pending.toLocaleString()}</div>
              </div>

              <div className="bp-balance-card bp-stats">
                <div className="bp-stats-row">
                  <span className="bp-stats-label">Umumiy sarflangan</span>
                  <span className="bp-stats-value">${balance.total_spent.toLocaleString()}</span>
                </div>
                <div className="bp-stats-row">
                  <span className="bp-stats-label">Platforma komissiyasi</span>
                  <span className="bp-stats-value">${Math.round(balance.total_spent * 0.1).toLocaleString()}</span>
                </div>
                <div className="bp-stats-row">
                  <span className="bp-stats-label">Aktiv kontraktlar</span>
                  <span className="bp-stats-value">3 ta</span>
                </div>
              </div>
            </div>

            <div className="bp-recent-transactions">
              <div className="bp-section-header">
                <h3>So'nggi tranzaksiyalar</h3>
                <button 
                  className="bp-view-all-btn"
                  onClick={() => setActiveTab("transactions")}
                >
                  Hammasini ko'rish <ChevronRight size={14} />
                </button>
              </div>
              <div className="bp-transactions-list">
                {transactions.slice(0, 5).map(transaction => (
                  <div key={transaction.id} className="bp-transaction-item">
                    <div className="bp-transaction-icon">
                      {getTransactionIcon(transaction.type)}
                    </div>
                    <div className="bp-transaction-info">
                      <div className="bp-transaction-description">{transaction.description}</div>
                      <div className="bp-transaction-date">
                        <Calendar size={12} />
                        {new Date(transaction.date).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="bp-transaction-amount">
                      <span className={transaction.amount > 0 ? "bp-positive" : "bp-negative"}>
                        {transaction.amount > 0 ? "+" : ""}{formatAmount(transaction.amount)}
                      </span>
                      {getStatusBadge(transaction.status)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Payment Methods Tab */}
        {activeTab === "methods" && (
          <div className="bp-payment-methods">
            <div className="bp-section-header">
              <h3>To'lov usullari</h3>
              <div className="bp-header-buttons">
                <button className="bp-add-btn" onClick={() => setShowAddCard(true)}>
                  <Plus size={16} /> Karta qo'shish
                </button>
                <button className="bp-add-btn bp-bank" onClick={() => setShowAddBank(true)}>
                  <Building size={16} /> Bank hisobi
                </button>
              </div>
            </div>

            <div className="bp-methods-list">
              {paymentMethods.map(method => (
                <div key={method.id} className={`bp-method-card ${method.isDefault ? "bp-default" : ""}`}>
                  <div className="bp-method-icon">
                    {method.type === "card" ? (
                      <CreditCard size={24} />
                    ) : (
                      <Building size={24} />
                    )}
                  </div>
                  <div className="bp-method-info">
                    {method.type === "card" ? (
                      <>
                        <div className="bp-method-name">
                          {method.brand} •••• {method.last4}
                        </div>
                        <div className="bp-method-details">
                          <span>Amal qilish muddati: {method.expiry}</span>
                          <span>Karta egasi: {method.cardholderName}</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="bp-method-name">{method.bankName}</div>
                        <div className="bp-method-details">
                          <span>Hisob egasi: {method.accountName}</span>
                          <span>Hisob raqami: {method.accountNumber}</span>
                        </div>
                      </>
                    )}
                    {method.isDefault && (
                      <span className="bp-default-badge">Asosiy</span>
                    )}
                  </div>
                  <div className="bp-method-actions">
                    {!method.isDefault && (
                      <button 
                        className="bp-method-action bp-set-default"
                        onClick={() => handleSetDefault(method.id)}
                        title="Asosiy qilish"
                      >
                        <Check size={16} />
                      </button>
                    )}
                    <button 
                      className="bp-method-action bp-delete"
                      onClick={() => handleDeleteMethod(method.id)}
                      title="O'chirish"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="bp-security-notice">
              <Lock size={16} />
              <div>
                <strong>Xavfsiz va ishonchli</strong>
                <p>Barcha to'lov ma'lumotlari shifrlangan va xavfsiz saqlanadi.</p>
              </div>
            </div>
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === "transactions" && (
          <div className="bp-transactions-full">
            <div className="bp-section-header">
              <h3>Barcha tranzaksiyalar</h3>
              <button className="bp-download-btn">
                <Download size={16} /> Yuklab olish
              </button>
            </div>

            <div className="bp-transactions-table">
              <div className="bp-table-header">
                <div>Sana</div>
                <div>Tavsif</div>
                <div>Ma'lumotnoma</div>
                <div>Summa</div>
                <div>Holat</div>
              </div>
              {transactions.map(transaction => (
                <div key={transaction.id} className="bp-table-row">
                  <div className="bp-cell bp-date">
                    {new Date(transaction.date).toLocaleDateString()}
                  </div>
                  <div className="bp-cell bp-description">
                    <div className="bp-desc-text">{transaction.description}</div>
                    <div className="bp-desc-type">{transaction.type}</div>
                  </div>
                  <div className="bp-cell bp-reference">{transaction.reference}</div>
                  <div className={`bp-cell bp-amount ${transaction.amount > 0 ? "bp-positive" : "bp-negative"}`}>
                    {transaction.amount > 0 ? "+" : ""}{formatAmount(transaction.amount)}
                  </div>
                  <div className="bp-cell bp-status">
                    {getStatusBadge(transaction.status)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add Card Modal */}
        {showAddCard && (
          <div className="bp-modal-overlay" onClick={() => setShowAddCard(false)}>
            <div className="bp-modal-content" onClick={e => e.stopPropagation()}>
              <div className="bp-modal-header">
                <h3>Yangi karta qo'shish</h3>
                <button className="bp-close-modal" onClick={() => setShowAddCard(false)}>
                  <X size={20} />
                </button>
              </div>
              <div className="bp-modal-body">
                <div className="bp-form-group">
                  <label>Karta raqami</label>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    value={newCard.cardNumber}
                    onChange={(e) => setNewCard({...newCard, cardNumber: e.target.value})}
                  />
                </div>
                <div className="bp-form-group">
                  <label>Karta egasining ismi</label>
                  <input
                    type="text"
                    placeholder="JOHN DOE"
                    value={newCard.cardName}
                    onChange={(e) => setNewCard({...newCard, cardName: e.target.value})}
                  />
                </div>
                <div className="bp-form-row">
                  <div className="bp-form-group">
                    <label>Amal qilish muddati</label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      value={newCard.expiryDate}
                      onChange={(e) => setNewCard({...newCard, expiryDate: e.target.value})}
                    />
                  </div>
                  <div className="bp-form-group">
                    <label>CVV</label>
                    <input
                      type="password"
                      placeholder="123"
                      maxLength="3"
                      value={newCard.cvv}
                      onChange={(e) => setNewCard({...newCard, cvv: e.target.value})}
                    />
                  </div>
                </div>
              </div>
              <div className="bp-modal-footer">
                <button className="bp-cancel-btn" onClick={() => setShowAddCard(false)}>
                  Bekor qilish
                </button>
                <button className="bp-submit-btn" onClick={handleAddCard}>
                  Qo'shish
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Bank Modal */}
        {showAddBank && (
          <div className="bp-modal-overlay" onClick={() => setShowAddBank(false)}>
            <div className="bp-modal-content" onClick={e => e.stopPropagation()}>
              <div className="bp-modal-header">
                <h3>Bank hisobi qo'shish</h3>
                <button className="bp-close-modal" onClick={() => setShowAddBank(false)}>
                  <X size={20} />
                </button>
              </div>
              <div className="bp-modal-body">
                <div className="bp-form-group">
                  <label>Bank nomi</label>
                  <input
                    type="text"
                    placeholder="Masalan: Uzcard, Visa"
                    value={newBank.bankName}
                    onChange={(e) => setNewBank({...newBank, bankName: e.target.value})}
                  />
                </div>
                <div className="bp-form-group">
                  <label>Hisob egasining ismi</label>
                  <input
                    type="text"
                    placeholder="Ism Familiya"
                    value={newBank.accountName}
                    onChange={(e) => setNewBank({...newBank, accountName: e.target.value})}
                  />
                </div>
                <div className="bp-form-group">
                  <label>Hisob raqami</label>
                  <input
                    type="text"
                    placeholder="Hisob raqami"
                    value={newBank.accountNumber}
                    onChange={(e) => setNewBank({...newBank, accountNumber: e.target.value})}
                  />
                </div>
                <div className="bp-form-group">
                  <label>Routing raqami</label>
                  <input
                    type="text"
                    placeholder="Routing raqami"
                    value={newBank.routingNumber}
                    onChange={(e) => setNewBank({...newBank, routingNumber: e.target.value})}
                  />
                </div>
              </div>
              <div className="bp-modal-footer">
                <button className="bp-cancel-btn" onClick={() => setShowAddBank(false)}>
                  Bekor qilish
                </button>
                <button className="bp-submit-btn" onClick={handleAddBank}>
                  Qo'shish
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Withdraw Modal */}
        {showWithdrawModal && (
          <div className="bp-modal-overlay" onClick={() => setShowWithdrawModal(false)}>
            <div className="bp-modal-content bp-withdraw" onClick={e => e.stopPropagation()}>
              <div className="bp-modal-header">
                <h3>Pul yechish</h3>
                <button className="bp-close-modal" onClick={() => setShowWithdrawModal(false)}>
                  <X size={20} />
                </button>
              </div>
              <div className="bp-modal-body">
                <div className="bp-available-balance">
                  <span>Mavjud balans:</span>
                  <strong>${balance.available.toLocaleString()}</strong>
                </div>
                <div className="bp-form-group">
                  <label>Summa ($)</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                  />
                </div>
                <div className="bp-form-group">
                  <label>To'lov usuli</label>
                  <select onChange={(e) => setSelectedMethod(e.target.value)}>
                    <option value="">Tanlang</option>
                    {paymentMethods.map(method => (
                      <option key={method.id} value={method.id}>
                        {method.type === "card" 
                          ? `${method.brand} •••• ${method.last4}`
                          : `${method.bankName} - ${method.accountNumber}`}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="bp-info-note">
                  <AlertCircle size={14} />
                  <span>Pul yechish 1-3 ish kunida hisobingizga tushadi</span>
                </div>
              </div>
              <div className="bp-modal-footer">
                <button className="bp-cancel-btn" onClick={() => setShowWithdrawModal(false)}>
                  Bekor qilish
                </button>
                <button 
                  className="bp-submit-btn"
                  onClick={handleWithdraw}
                  disabled={!withdrawAmount || withdrawAmount <= 0 || !selectedMethod}
                >
                  Yechish
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success Toast */}
        {showSuccessToast && (
          <div className="bp-success-toast">
            <Check size={18} />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default BillingPayments;