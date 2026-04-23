import { useEffect, useState, useMemo } from "react";
import { 
  getBalance, 
  getPayments, 
  deposit, 
  withdraw, 
  getCards, 
  addCard, 
  deleteCard 
} from "../../../api/payments";
import { 
  CreditCard, 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft, 
  History, 
  ShieldCheck, 
  Trash2, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Lock, 
  Info,
  MoreVertical,
  Banknote,
  Navigation,
  Download,
  Building2,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  RefreshCw,
  Wallet as WalletIcon,
  Zap,
  Layers
} from "lucide-react";
import { useTranslation } from "react-i18next";
import "./Wallet.css";

export default function Wallet() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("overview"); // overview, transactions, methods
  const [balance, setBalance] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [showAddCard, setShowAddCard] = useState(false);
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  
  // Form States
  const [amount, setAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [newCard, setNewCard] = useState({ 
    card_number: "", 
    card_holder: "", 
    expiry_date: "", 
    card_type: "uzcard" 
  });
  const [selectedCard, setSelectedCard] = useState(null);

  const [processing, setProcessing] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [toast, setToast] = useState({ msg: "", type: "" });

  const notify = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "" }), 5000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [balRes, txRes, cardRes] = await Promise.all([
        getBalance(),
        getPayments({ limit: 50 }),
        getCards()
      ]);
      
      setBalance(balRes?.data?.balance || balRes?.balance || null);
      setTransactions(txRes?.data?.transactions || []);
      const cardList = cardRes?.data || [];
      setCards(cardList);
      if (cardList.length > 0) setSelectedCard(cardList[0]);
      
    } catch (e) {
      console.error("Wallet load error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleAddCard = async (e) => {
    e.preventDefault();
    if (!newCard.card_number || !newCard.card_holder) return;
    
    const cleanNumber = newCard.card_number.replace(/\s+/g, '');
    if (cleanNumber.length !== 16) {
      notify(t("wallet.errorCardNumber"), "error");
      return;
    }

    setProcessing(true);
    const res = await addCard(newCard);
    setProcessing(false);
    if (res?.success) {
      notify(t("wallet.successCard"));
      setShowAddCard(false);
      setNewCard({ card_number: "", card_holder: "", expiry_date: "", card_type: "uzcard" });
      loadData();
    } else {
      notify(res?.message || t("wallet.errorGeneric"), "error");
    }
  };

  const handleDeposit = async () => {
    if (!amount || Number(amount) <= 0) return;
    setProcessing(true);
    const res = await deposit({ 
      amount: Number(amount),
      card_id: selectedCard?.id,
      gateway: selectedCard?.card_type || "demo"
    });
    setProcessing(false);
    if (res?.success) {
      notify(t("wallet.successDeposit"));
      setShowDeposit(false);
      setAmount("");
      loadData();
    } else {
      notify(res?.message || t("wallet.errorGeneric"), "error");
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || Number(withdrawAmount) <= 0) return;
    if (!selectedCard) {
      notify(t("wallet.selectCard") || "Kartani tanlang", "error");
      return;
    }
    
    setProcessing(true);
    const res = await withdraw({
      amount: Number(withdrawAmount),
      card_id: selectedCard.id
    });
    setProcessing(false);
    
    if (res?.success) {
      notify(t("wallet.successWithdraw") || "Yuborildi");
      setShowWithdraw(false);
      setWithdrawAmount("");
      loadData();
    } else {
      notify(res?.message || t("wallet.errorGeneric"), "error");
    }
  };

  const handleDeleteCard = async () => {
    if (!confirmDeleteId) return;
    setProcessing(true);
    const res = await deleteCard(confirmDeleteId);
    setProcessing(false);
    if (res?.success) {
      notify(t("wallet.successDelete"));
      setConfirmDeleteId(null);
      loadData();
    } else {
      notify(res?.message || t("wallet.errorGeneric"), "error");
    }
  };

  const getTxIcon = (type) => {
    switch (type) {
      case 'deposit': return <ArrowDownCircle className="tx-icon-v" />;
      case 'withdrawal': return <ArrowUpCircle className="tx-icon-v" />;
      case 'escrow_hold': return <Lock className="tx-icon-v" />;
      case 'escrow_release': return <CheckCircle2 className="tx-icon-v" />;
      default: return <History className="tx-icon-v" />;
    }
  };

  const formatCardNumber = (num) => {
    if (!num) return "**** **** **** ****";
    return num.replace(/(\d{4})/g, '$1 ').trim();
  };

  if (loading && !balance) {
    return <div className="wallet-loading-screen"><div className="premium-loader"></div></div>;
  }

  return (
    <div className="wallet-v3 soft-fade-in">
      {/* Toast Notification */}
      {toast.msg && (
        <div className={`premium-toast ${toast.type === "error" ? "error" : "success"}`}>
          {toast.type === "error" ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Header with Luxury Tabs */}
      <header className="wallet-v3-header">
        <div className="header-brand">
          <h1>{t("wallet.title")}</h1>
          <p className="subtitle">{t("wallet.subtitle")}</p>
        </div>
        
        <div className="header-nav-container">
           <div className="luxury-tabs">
             {["overview", "transactions", "methods"].map(tab => (
               <button 
                 key={tab} 
                 className={`luxury-tab-btn ${activeTab === tab ? "active" : ""}`}
                 onClick={() => setActiveTab(tab)}
               >
                 {t(`wallet.${tab}`)}
               </button>
             ))}
           </div>
        </div>

        <div className="header-v3-actions">
           <button className="glass-btn secondary" onClick={() => setShowWithdraw(true)}>
             <TrendingUp size={18} /> {t("wallet.withdraw")}
           </button>
           <button className="glass-btn primary" onClick={() => setShowDeposit(true)}>
             <Plus size={18} /> {t("wallet.deposit")}
           </button>
        </div>
      </header>

      {/* Overview Content */}
      {activeTab === "overview" && (
        <div className="wallet-v3-grid">
           {/* Main Card Section */}
           <div className="v3-main-col">
              <div className="luxury-balance-card highlight-glow">
                 <div className="card-mesh"></div>
                 <div className="card-top-v3">
                    <div className="balance-info">
                       <span className="info-label">{t("wallet.availableBalance")}</span>
                       <h2 className="amount-display">
                         <span className="curr">$</span>
                         {Number(balance?.available_balance || 0).toLocaleString()}
                       </h2>
                    </div>
                    <div className="elite-badge">
                       <Zap size={14} fill="currentColor" />
                       ELITE ACCOUNT
                    </div>
                 </div>

                 <div className="card-visual-decoration">
                    <Layers size={140} strokeWidth={0.5} />
                 </div>

                 <div className="card-bottom-v3">
                    <div className="mini-stat">
                       <span className="m-label">{t("wallet.lockedBalance")}</span>
                       <span className="m-value">${Number(balance?.escrow_balance || 0).toLocaleString()}</span>
                    </div>
                    <div className="v-divider"></div>
                    <div className="mini-stat">
                       <span className="m-label">{t("wallet.totalEarned")}</span>
                       <span className="m-value">${Number(balance?.total_earned || 0).toLocaleString()}</span>
                    </div>
                    <div className="card-logo-v3">
                       <span className="l-text">UzWork</span>
                       <span className="l-sub">Elite Wallet</span>
                    </div>
                 </div>
              </div>

              <div className="v3-cards-shelf">
                 <div className="shelf-header">
                    <h3>{t("wallet.myCards")}</h3>
                    <button className="view-all-link" onClick={() => setActiveTab("methods")}>
                      {t("common.viewAll")} <ChevronRight size={14} />
                    </button>
                 </div>
                 <div className="shelf-row">
                    {cards.length === 0 ? (
                      <div className="add-card-placeholder-v3" onClick={() => setShowAddCard(true)}>
                         <Plus size={24} />
                         <span>{t("wallet.addCard")}</span>
                      </div>
                    ) : (
                      cards.slice(0, 3).map(card => (
                        <div 
                           key={card.id} 
                           className={`v3-mini-card ${card.card_type} ${selectedCard?.id === card.id ? 'active' : ''}`}
                           onClick={() => setSelectedCard(card)}
                        >
                           <div className="mv-top">
                              <span className="mv-type">{card.card_type.toUpperCase()}</span>
                              <div className="mv-check">{selectedCard?.id === card.id && <CheckCircle2 size={12}/>}</div>
                           </div>
                           <div className="mv-chip"></div>
                           <div className="mv-number">•••• {card.card_number.slice(-4)}</div>
                        </div>
                      ))
                    )}
                 </div>
              </div>
           </div>

           {/* Sidebar Section */}
           <div className="v3-side-col">
              <div className="v3-activity-glass">
                 <div className="activity-header">
                    <h3>{t("reports.recentActivity")}</h3>
                    <button className="text-btn-v3" onClick={() => setActiveTab("transactions")}>
                       {t("common.viewAll")}
                    </button>
                 </div>
                 
                 <div className="activity-v3-list">
                    {transactions.length === 0 ? (
                      <div className="empty-v3">
                         <History size={40} />
                         <p>{t("wallet.noTransactions")}</p>
                      </div>
                    ) : (
                      transactions.slice(0, 7).map(tx => (
                        <div className="activity-v3-item" key={tx.id}>
                           <div className={`tx-v3-icon-box ${tx.type}`}>
                              {getTxIcon(tx.type)}
                           </div>
                           <div className="tx-v3-details">
                              <span className="tx-v3-title">{tx.job_title || t(`wallet.types.${tx.type}`)}</span>
                              <span className="tx-v3-meta">{tx.gateway?.toUpperCase() || 'SYSTEM'} • {new Date(tx.created_at).toLocaleDateString()}</span>
                           </div>
                           <div className={`tx-v3-amount ${['deposit', 'escrow_release', 'refund'].includes(tx.type) ? 'pos' : 'neg'}`}>
                              {['deposit', 'escrow_release', 'refund'].includes(tx.type) ? '+' : '-'}${Number(tx.amount).toLocaleString()}
                           </div>
                        </div>
                      ))
                    )}
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Transactions View */}
      {activeTab === "transactions" && (
        <div className="v3-full-content-box soft-fade-in">
           <div className="content-header-v3">
              <h3>{t("wallet.history")}</h3>
              <button className="glass-btn small-v3"><Download size={14}/> {t("common.export")}</button>
           </div>
           <div className="v3-table-container">
              <table className="v3-luxury-table">
                 <thead>
                    <tr>
                       <th>{t("reports.date")}</th>
                       <th>{t("reports.status")}</th>
                       <th>{t("common.description")}</th>
                       <th>{t("reports.amount")}</th>
                    </tr>
                 </thead>
                 <tbody>
                    {transactions.map(tx => (
                       <tr key={tx.id}>
                          <td>{new Date(tx.created_at).toLocaleDateString()}</td>
                          <td>
                             <span className={`v3-badge ${tx.type}`}>{t(`wallet.types.${tx.type}`)}</span>
                          </td>
                          <td className="desc-text">{tx.job_title || "-"}</td>
                          <td className={`amount-text ${['deposit', 'escrow_release', 'refund'].includes(tx.type) ? 'pos' : 'neg'}`}>
                             {['deposit', 'escrow_release', 'refund'].includes(tx.type) ? '+' : '-'}${Number(tx.amount).toLocaleString()}
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      )}

      {/* Methods View */}
      {activeTab === "methods" && (
         <div className="v3-full-content-box soft-fade-in">
            <div className="content-header-v3">
               <h3>{t("wallet.myCards")}</h3>
               <button className="glass-btn primary small-v3" onClick={() => setShowAddCard(true)}>
                  <Plus size={14}/> {t("wallet.addCard")}
               </button>
            </div>
            <div className="v3-cards-grid">
               {cards.map(card => (
                  <div key={card.id} className={`v3-luxury-card ${card.card_type}`}>
                     <div className="glare"></div>
                     <div className="v3-card-inner">
                        <div className="v3-card-head">
                           <span className="v3-card-brand">{card.card_type.toUpperCase()}</span>
                           <button className="v3-delete-btn" onClick={() => setConfirmDeleteId(card.id)}><Trash2 size={16}/></button>
                        </div>
                        <div className="v3-card-chip"></div>
                        <div className="v3-card-number">{formatCardNumber(card.card_number)}</div>
                        <div className="v3-card-foot">
                           <div className="v3-foot-item">
                              <span className="l">HOLDER</span>
                              <span className="v">{card.card_holder}</span>
                           </div>
                           <div className="v3-foot-item">
                              <span className="l">EXP</span>
                              <span className="v">{card.expiry_date}</span>
                           </div>
                        </div>
                     </div>
                  </div>
               ))}
               <div className="v3-add-card-btn" onClick={() => setShowAddCard(true)}>
                  <Plus size={40} />
                  <span>{t("wallet.addCard")}</span>
               </div>
            </div>
         </div>
      )}

      {/* MODALS (Simplified for better UI) */}
      {showAddCard && (
        <div className="v3-modal-overlay" onClick={() => setShowAddCard(false)}>
          <div className="v3-modal glass-morphism-modal" onClick={e => e.stopPropagation()}>
            <div className="v3-modal-header">
              <h3>{t("wallet.addCard")}</h3>
              <button className="close-v3" onClick={() => setShowAddCard(false)}><X/></button>
            </div>
            <form onSubmit={handleAddCard} className="v3-modal-form">
              <div className="v3-field">
                <label>{t("wallet.cardNumberPlaceholder")}</label>
                <input 
                  placeholder="8600 •••• •••• ••••" 
                  value={newCard.card_number}
                  onChange={e => setNewCard({...newCard, card_number: e.target.value})}
                  maxLength={16}
                />
              </div>
              <div className="v3-field">
                <label>{t("wallet.cardHolderPlaceholder")}</label>
                <input 
                  placeholder="FULL NAME"
                  value={newCard.card_holder}
                  onChange={e => setNewCard({...newCard, card_holder: e.target.value.toUpperCase()})}
                />
              </div>
              <div className="v3-field-row">
                <div className="v3-field">
                  <label>{t("wallet.expiryDatePlaceholder")}</label>
                  <input placeholder="MM/YY" value={newCard.expiry_date} onChange={e => setNewCard({...newCard, expiry_date: e.target.value})} />
                </div>
                <div className="v3-field">
                  <label>Type</label>
                  <select value={newCard.card_type} onChange={e => setNewCard({...newCard, card_type: e.target.value})}>
                    <option value="uzcard">Uzcard</option>
                    <option value="humo">Humo</option>
                    <option value="visa">Visa</option>
                    <option value="mastercard">Mastercard</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="v3-submit-btn" disabled={processing}>
                {processing ? <RefreshCw className="spin"/> : t("wallet.addCard")}
              </button>
            </form>
          </div>
        </div>
      )}

      {showDeposit && (
        <div className="v3-modal-overlay" onClick={() => setShowDeposit(false)}>
          <div className="v3-modal glass-morphism-modal small-v3" onClick={e => e.stopPropagation()}>
            <div className="v3-modal-header">
              <h3>{t("wallet.deposit")}</h3>
              <button className="close-v3" onClick={() => setShowDeposit(false)}><X/></button>
            </div>
            <div className="v3-modal-body">
               <div className="v3-field">
                  <label>{t("wallet.amountPlaceholder")}</label>
                  <div className="amount-input-box">
                    <span className="unit">$</span>
                    <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" />
                  </div>
               </div>
               <div className="v3-selected-card-box">
                  {selectedCard ? (
                    <div className={`mini-card-item ${selectedCard.card_type}`}>
                       <span>{selectedCard.card_type.toUpperCase()}</span>
                       <span>•••• {selectedCard.card_number.slice(-4)}</span>
                    </div>
                  ) : <div className="no-cards-error">{t("wallet.noCards")}</div>}
               </div>
               <button className="v3-submit-btn" onClick={handleDeposit} disabled={processing || !selectedCard}>
                 {processing ? <RefreshCw className="spin" /> : t("wallet.deposit")}
               </button>
            </div>
          </div>
        </div>
      )}
      
      {showWithdraw && (
        <div className="v3-modal-overlay" onClick={() => setShowWithdraw(false)}>
          <div className="v3-modal glass-morphism-modal small-v3" onClick={e => e.stopPropagation()}>
            <div className="v3-modal-header">
              <h3>{t("wallet.withdraw")}</h3>
              <button className="close-v3" onClick={() => setShowWithdraw(false)}><X/></button>
            </div>
            <div className="v3-modal-body">
               <div className="v3-available-badge">
                  <span>{t("wallet.availableBalance")}: </span>
                  <strong>${Number(balance?.available_balance || 0).toLocaleString()}</strong>
               </div>
               <div className="v3-field">
                  <label>{t("wallet.amountPlaceholder")}</label>
                  <div className="amount-input-box">
                    <span className="unit">$</span>
                    <input type="number" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} placeholder="0.00" />
                  </div>
               </div>
               <div className="v3-field">
                  <label>Select Card</label>
                  <div className="v3-card-selection-list">
                     {cards.map(card => (
                       <div 
                         key={card.id} 
                         className={`v3-selection-item ${selectedCard?.id === card.id ? 'active' : ''}`}
                         onClick={() => setSelectedCard(card)}
                       >
                         <span className={`v3-v-type ${card.card_type}`}>{card.card_type.charAt(0).toUpperCase()}</span>
                         <span>•••• {card.card_number.slice(-4)}</span>
                         {selectedCard?.id === card.id && <CheckCircle2 size={14}/>}
                       </div>
                     ))}
                  </div>
               </div>
               <button className="v3-submit-btn" onClick={handleWithdraw} disabled={processing || !selectedCard || !withdrawAmount}>
                 {processing ? <RefreshCw className="spin" /> : t("wallet.withdraw")}
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {confirmDeleteId && (
        <div className="v3-modal-overlay">
          <div className="v3-modal delete-v3 glass-morphism-modal">
             <div className="warn-icon-box"><AlertCircle size={40}/></div>
             <h3>{t("wallet.deleteCard")}</h3>
             <p>{t("wallet.confirmDelete")}</p>
             <div className="v3-modal-footer-row">
                <button className="btn-v3-cancel" onClick={() => setConfirmDeleteId(null)}>{t("wallet.no")}</button>
                <button className="btn-v3-delete" onClick={handleDeleteCard} disabled={processing}>{t("wallet.yes")}</button>
             </div>
          </div>
        </div>
      )}

    </div>
  );
}
