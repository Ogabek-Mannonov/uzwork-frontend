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
  Navigation
} from "lucide-react";
import { useTranslation } from "react-i18next";
import "./Wallet.css";

export default function Wallet() {
  const { t } = useTranslation();
  const [balance, setBalance] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [showAddCard, setShowAddCard] = useState(false);
  const [showDeposit, setShowDeposit] = useState(false);
  
  // Form States
  const [amount, setAmount] = useState("");
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
        getPayments({ limit: 10 }),
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
      notify(t("wallet.errorCardNumber") || "Karta raqami 16 xonali bo'lishi shart", "error");
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

  const handleDeleteCard = async () => {
    if (!confirmDeleteId) return;
    setProcessing(true);
    const res = await deleteCard(confirmDeleteId);
    setProcessing(false);
    if (res?.success) {
      notify(t("wallet.successDelete") || "Karta o'chirildi");
      setConfirmDeleteId(null);
      loadData();
    } else {
      notify(res?.message || t("wallet.errorGeneric"), "error");
    }
  };

  const getTxIcon = (type) => {
    switch (type) {
      case 'deposit': return <ArrowDownCircle className="deposit" />;
      case 'withdrawal': return <ArrowUpCircle className="withdrawal" />;
      case 'escrow_hold': return <Lock className="escrow_hold" />;
      case 'escrow_release': return <CheckCircle2 className="escrow_release" />;
      case 'fee': return <Info className="fee" />;
      default: return <History />;
    }
  };

  const formatCardNumber = (num) => {
    if (!num) return "**** **** **** ****";
    return num.replace(/(\d{4})/g, '$1 ').trim();
  };

  return (
    <div className="wallet-page soft-fade-in">
      {/* Toast */}
      {toast.msg && (
        <div className={`proposal-toast ${toast.type === "error" ? "proposal-toast--error" : "proposal-toast--success"}`}>
          {toast.type === "error" ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          {toast.msg}
        </div>
      )}

      <header className="wallet-header">
        <h1>{t("wallet.title")}</h1>
      </header>

      <div className="wallet-grid">
        
        {/* Left Column: Balance & Cards */}
        <div className="wallet-left">
          
          <div className="wallet-balance-card">
             <div className="card-pattern">
               <Navigation size={180} />
             </div>
             
             <div className="card-top-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 1 }}>
               <div>
                 <div className="balance-label">{t("wallet.availableBalance")}</div>
                 <div className="balance-amount">
                   ${Number(balance?.available_balance || 0).toLocaleString()}
                 </div>
               </div>
               <div style={{ opacity: 0.8, textAlign: 'right' }}>
                 <div style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px' }}>UzWork</div>
                 <div style={{ fontSize: '10px', fontWeight: 600 }}>Elite Wallet</div>
               </div>
             </div>
             
             <div className="balance-stats" style={{ zIndex: 1 }}>
                <div className="stat-item">
                  <span className="stat-label">{t("wallet.lockedBalance")}</span>
                  <span className="stat-value">${Number(balance?.escrow_balance || 0).toLocaleString()}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">{t("wallet.totalEarned")}</span>
                  <span className="stat-value">${Number(balance?.total_earned || 0).toLocaleString()}</span>
                </div>
             </div>
          </div>

          <div className="cards-section">
            <div className="section-header">
              <h2 className="section-title">{t("wallet.myCards")}</h2>
              <button className="btn-add-card" onClick={() => setShowAddCard(true)}>
                <Plus size={18} /> {t("wallet.addCard")}
              </button>
            </div>

            <div className="cards-carousel">
              {cards.length === 0 ? (
                <div className="no-cards-placeholder" onClick={() => setShowAddCard(true)}>
                  <CreditCard size={32} />
                  <p>{t("wallet.noCards")}</p>
                </div>
              ) : (
                cards.map(card => (
                  <div 
                    key={card.id} 
                    className={`linked-card ${card.card_type} ${selectedCard?.id === card.id ? 'active' : ''}`}
                    onClick={() => setSelectedCard(card)}
                  >
                    <div className="card-top">
                      <div className="card-top-left"></div>
                      <div className="card-top-right">
                        <div className="card-type-logo">{card.card_type.toUpperCase()}</div>
                        <button 
                          className="btn-card-delete" 
                          onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(card.id); }}
                          title={t("wallet.deleteCard")}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                    <svg className="card-chip" viewBox="0 0 50 40" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <linearGradient id={`chipGrad-${card.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#b8820a"/>
                          <stop offset="30%" stopColor="#f5c842"/>
                          <stop offset="55%" stopColor="#d4a017"/>
                          <stop offset="80%" stopColor="#e8c240"/>
                          <stop offset="100%" stopColor="#c09010"/>
                        </linearGradient>
                      </defs>
                      <rect width="50" height="40" rx="5" fill={`url(#chipGrad-${card.id})`}/>
                      {/* Horizontal lines */}
                      <line x1="0" y1="13" x2="50" y2="13" stroke="rgba(0,0,0,0.2)" strokeWidth="1.5"/>
                      <line x1="0" y1="27" x2="50" y2="27" stroke="rgba(0,0,0,0.2)" strokeWidth="1.5"/>
                      {/* Vertical lines */}
                      <line x1="17" y1="0" x2="17" y2="40" stroke="rgba(0,0,0,0.2)" strokeWidth="1.5"/>
                      <line x1="33" y1="0" x2="33" y2="40" stroke="rgba(0,0,0,0.2)" strokeWidth="1.5"/>
                      {/* Center contact */}
                      <rect x="17" y="13" width="16" height="14" rx="2" fill="rgba(0,0,0,0.08)" stroke="rgba(0,0,0,0.12)" strokeWidth="0.5"/>
                      {/* Shine */}
                      <rect width="50" height="40" rx="5" fill="url(#shine)" opacity="0.3"/>
                      <defs>
                        <linearGradient id="shine" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="white" stopOpacity="0.5"/>
                          <stop offset="100%" stopColor="white" stopOpacity="0"/>
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="card-number">{formatCardNumber(card.card_number)}</div>
                    <div className="card-bottom">
                       <span className="card-holder">{card.card_holder}</span>
                       <span className="card-expiry">{card.expiry_date}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <button className="btn-demo-topup" onClick={() => setShowDeposit(true)}>
            <Banknote size={20} /> {t("wallet.topUpDemo")}
          </button>
        </div>

        {/* Right Column: Recent Transactions */}
        <div className="wallet-right">
          <div className="transactions-section">
             <div className="section-header">
               <h2 className="section-title">{t("wallet.transactions")}</h2>
             </div>
             
             <div className="transaction-list">
               {transactions.length === 0 ? (
                 <div className="no-tx-placeholder">
                   <History size={32} />
                   <p>{t("wallet.noTransactions")}</p>
                 </div>
               ) : (
                 transactions.map(tx => (
                   <div className="transaction-item" key={tx.id}>
                     <div className="tx-left">
                        <div className={`tx-icon ${tx.type}`}>
                          {getTxIcon(tx.type)}
                        </div>
                        <div className="tx-info">
                           <h4>{tx.job_title || t(`wallet.types.${tx.type}`)}</h4>
                           <p>{tx.gateway?.toUpperCase() || 'INTERNAL'}</p>
                        </div>
                     </div>
                     <div className="tx-right">
                        <div className={`tx-amount ${['deposit', 'escrow_release', 'refund'].includes(tx.type) ? 'positive' : 'negative'}`}>
                           {['deposit', 'escrow_release', 'refund'].includes(tx.type) ? '+' : '-'}${Number(tx.amount).toLocaleString()}
                        </div>
                        <div className="tx-date">{new Date(tx.created_at).toLocaleDateString()}</div>
                     </div>
                   </div>
                 ))
               )}
             </div>
          </div>
        </div>
      </div>

      {/* MODALS */}
      {showAddCard && (
        <div className="wallet-modal-overlay" onClick={() => setShowAddCard(false)}>
          <div className="wallet-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{t("wallet.addCard")}</h3>
              <button className="modal-close" onClick={() => setShowAddCard(false)}><X/></button>
            </div>
            <form onSubmit={handleAddCard}>
              <div className="form-group">
                <label>{t("wallet.cardNumberPlaceholder")}</label>
                <input 
                  className="form-input" 
                  placeholder="8600 **** **** ****" 
                  value={newCard.card_number}
                  onChange={e => setNewCard({...newCard, card_number: e.target.value})}
                  maxLength={16}
                />
              </div>
              <div className="form-group">
                <label>{t("wallet.cardHolderPlaceholder")}</label>
                <input 
                  className="form-input" 
                  placeholder="ISM FAMILIYA"
                  value={newCard.card_holder}
                  onChange={e => setNewCard({...newCard, card_holder: e.target.value})}
                />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>{t("wallet.expiryDatePlaceholder")}</label>
                  <input 
                    className="form-input" 
                    placeholder="12/28" 
                    value={newCard.expiry_date}
                    onChange={e => setNewCard({...newCard, expiry_date: e.target.value})}
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Karta turi</label>
                  <select 
                    className="form-input"
                    value={newCard.card_type}
                    onChange={e => setNewCard({...newCard, card_type: e.target.value})}
                  >
                    <option value="uzcard">Uzcard</option>
                    <option value="humo">Humo</option>
                    <option value="visa">Visa</option>
                    <option value="mastercard">Mastercard</option>
                  </select>
                </div>
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn-primary" disabled={processing}>
                  {processing ? '...' : t("wallet.addCard")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeposit && (
        <div className="wallet-modal-overlay" onClick={() => setShowDeposit(false)}>
          <div className="wallet-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{t("wallet.deposit")}</h3>
              <button className="modal-close" onClick={() => setShowDeposit(false)}><X/></button>
            </div>
            <div className="form-group">
              <label>{t("wallet.amountPlaceholder")}</label>
              <input 
                type="number" 
                className="form-input" 
                placeholder="100" 
                value={amount}
                onChange={e => setAmount(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Karta orqali</label>
              {selectedCard ? (
                <div className={`linked-card mini ${selectedCard.card_type}`} style={{ minWidth: 'auto', height: 'auto', padding: '12px', fontSize: '13px' }}>
                  {formatCardNumber(selectedCard.card_number)}
                </div>
              ) : (
                <div className="no-cards-placeholder small" onClick={() => { setShowDeposit(false); setShowAddCard(true); }}>
                   Karta qo'shing
                </div>
              )}
            </div>
            <div className="modal-actions">
              <button className="btn-primary" onClick={handleDeposit} disabled={processing || !selectedCard}>
                {processing ? '...' : t("wallet.deposit")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {confirmDeleteId && (
        <div className="wallet-modal-overlay" onClick={() => setConfirmDeleteId(null)}>
          <div className="wallet-modal delete-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="icon-warn"><AlertCircle size={32} /></div>
              <h3>{t("wallet.deleteCard")}</h3>
            </div>
            <div className="modal-body">
              <p>{t("wallet.confirmDelete")}</p>
            </div>
            <div className="modal-actions">
               <button className="btn-secondary" onClick={() => setConfirmDeleteId(null)}>{t("wallet.no")}</button>
               <button className="btn-primary btn-danger" onClick={handleDeleteCard} disabled={processing}>
                 {processing ? '...' : t("wallet.yes")}
               </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
