import React, { useState } from 'react';
import { Plus, Laptop, Plane, Shield, Target, Trash2, PlusCircle } from 'lucide-react';
import { useGoals } from '../store/use-goals';
import { useSettings } from '../store/use-settings';
import { useToast } from '../store/use-toast';
import { PageHeader } from '../components/page-header';
import { formatMoney, toFaDigits } from '../lib/format';
import type { Goal } from '../types/index';
import styles from './goals-page.module.css';

const GOAL_ICONS: Record<string, React.ReactNode> = {
  laptop: <Laptop size={20} strokeWidth={1.8} />,
  plane:  <Plane  size={20} strokeWidth={1.8} />,
  shield: <Shield size={20} strokeWidth={1.8} />,
  target: <Target size={20} strokeWidth={1.8} />,
};

const COLORS = ['#8B5CF6', '#22D3EE', '#34D399', '#F59E0B', '#FB7185', '#6366F1'];

function GoalCard({ goal, currency }: { goal: Goal; currency: 'IRT' | 'USD' }) {
  const { removeGoal, deposit } = useGoals();
  const { addToast } = useToast();
  const [depositing, setDepositing] = useState(false);
  const [amount, setAmount] = useState('');

  const pct = Math.round((goal.savedAmount / goal.targetAmount) * 100);
  const remaining = goal.targetAmount - goal.savedAmount;

  const handleDeposit = () => {
    const n = Number(amount.replace(/\D/g, ''));
    if (n <= 0) return;
    deposit(goal.id, n);
    addToast(`${formatMoney(n, 'IRT', currency)} به "${goal.title}" اضافه شد`, 'success');
    setAmount('');
    setDepositing(false);
  };

  return (
    <div className={styles.goalCard} style={{ '--goal-color': goal.color } as React.CSSProperties}>
      <div className={styles.goalHeader}>
        <div className={styles.goalIcon} style={{ background: `${goal.color}22`, color: goal.color }}>
          {GOAL_ICONS[goal.icon] ?? <Target size={20} strokeWidth={1.8} />}
        </div>
        <div className={styles.goalTitles}>
          <p className={styles.goalTitle}>{goal.title}</p>
          <p className={styles.goalSub}>{toFaDigits(pct)}٪ تکمیل</p>
        </div>
        <button type="button" className={styles.deleteBtn} onClick={() => removeGoal(goal.id)}>
          <Trash2 size={14} strokeWidth={1.8} />
        </button>
      </div>

      <div className={styles.progressTrack}>
        <div
          className={styles.progressBar}
          style={{ width: `${pct}%`, background: goal.color }}
        />
      </div>

      <div className={styles.goalAmounts}>
        <span className={styles.saved}>{formatMoney(goal.savedAmount, 'IRT', currency)}</span>
        <span className={styles.target}>از {formatMoney(goal.targetAmount, 'IRT', currency)}</span>
      </div>

      {remaining > 0 && (
        <>
          {!depositing ? (
            <button type="button" className={styles.depositBtn} onClick={() => setDepositing(true)}
              style={{ borderColor: `${goal.color}44`, color: goal.color }}>
              <PlusCircle size={14} strokeWidth={1.8} />
              افزودن مبلغ
            </button>
          ) : (
            <div className={styles.depositRow}>
              <input
                className={styles.depositInput}
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))}
                placeholder="مقدار (تومان)"
                inputMode="numeric"
                autoFocus
              />
              <button type="button" className={styles.confirmBtn} style={{ background: goal.color }} onClick={handleDeposit}>
                تأیید
              </button>
              <button type="button" className={styles.cancelDepBtn} onClick={() => { setDepositing(false); setAmount(''); }}>
                لغو
              </button>
            </div>
          )}
        </>
      )}
      {remaining <= 0 && <p className={styles.done}>هدف تکمیل شد</p>}
    </div>
  );
}

export function GoalsPage(): React.JSX.Element {
  const { goals, addGoal } = useGoals();
  const currency = useSettings((s) => s.currency);
  const { addToast } = useToast();
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [target, setTarget] = useState('');
  const [color, setColor] = useState(COLORS[0]);

  const handleAdd = () => {
    if (!title.trim() || !target) return;
    addGoal({ title: title.trim(), targetAmount: Number(target), savedAmount: 0, currency: 'IRT', color, icon: 'target' });
    addToast(`هدف "${title}" اضافه شد`, 'success');
    setTitle(''); setTarget(''); setAdding(false);
  };

  return (
    <div>
      <PageHeader title="اهداف مالی" subtitle="پیگیری پیشرفت پس‌انداز" />

      {adding && (
        <div className={styles.addForm}>
          <input className={styles.addInput} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="عنوان هدف" />
          <input className={styles.addInput} value={target} onChange={(e) => setTarget(e.target.value.replace(/\D/g, ''))} placeholder="مبلغ هدف (تومان)" inputMode="numeric" />
          <div className={styles.colorRow}>
            {COLORS.map((c) => (
              <button key={c} type="button" className={`${styles.colorDot} ${color === c ? styles.colorDotActive : ''}`}
                style={{ background: c }} onClick={() => setColor(c)} />
            ))}
          </div>
          <div className={styles.formActions}>
            <button type="button" className={styles.cancelAdd} onClick={() => setAdding(false)}>انصراف</button>
            <button type="button" className={styles.saveAdd} onClick={handleAdd}>ذخیره هدف</button>
          </div>
        </div>
      )}

      <div className={styles.grid}>
        {goals.map((g) => (
          <GoalCard key={g.id} goal={g} currency={currency} />
        ))}
        {!adding && (
          <button type="button" className={styles.addCard} onClick={() => setAdding(true)}>
            <Plus size={24} strokeWidth={1.8} />
            <span>هدف جدید</span>
          </button>
        )}
      </div>
    </div>
  );
}
