import React, { useEffect, useState } from 'react';
import { menuService } from '../../services/api.js';
import { useUiStore } from '../../store/uiStore.js';
import { Card } from '../../components/ui/Card.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton.jsx';
import { PageShell } from '../../components/layout/PageShell.jsx';
import { Flame, Dumbbell, Egg, Disc, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { format, addDays, isSameDay } from 'date-fns';

export const Menu = () => {
  const handleShare = async (item) => {
    if (navigator.share) {
      await navigator.share({
        title: 'DailyBite Menu',
        text: 'Check out today\'s tiffin: ' + item.name + ' - ' + item.calories + ' calories!',
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const { addToast } = useUiStore();
  const [loading, setLoading] = useState(true);
  const [weeklyMenus, setWeeklyMenus] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeMealTab, setActiveMealTab] = useState('lunch'); // lunch / dinner

  // Generate 7 days calendar strip
  const calendarDays = Array.from({ length: 7 }).map((_, i) => addDays(new Date(), i));

  const fetchWeeklyMenu = async () => {
    setLoading(true);
    try {
      const response = await menuService.getWeeklyMenu();
      if (response.success && response.data) {
        setWeeklyMenus(response.data);
      }
    } catch (err) {
      addToast(err.message || 'Failed to fetch weekly menu.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeeklyMenu();
  }, []);

  // Filter menu for selected date & mealType
  const getSelectedMenu = () => {
    return weeklyMenus.find(
      (m) =>
        m.mealType === activeMealTab &&
        isSameDay(new Date(m.date), selectedDate)
    );
  };

  const selectedMenu = getSelectedMenu();

  return (
    <PageShell
      title="Daily Menu"
      subtitle="Explore our nutritionally-balanced daily home-style meals"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Calendar Horizontal Selector strip */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Calendar size={14} />
            <span>SELECT DATE</span>
          </span>

          <div
            className="calendar-strip"
            style={{
              display: 'flex',
              gap: '10px',
              overflowX: 'auto',
              padding: '6px 0',
              scrollbarWidth: 'none',
            }}
          >
            {calendarDays.map((day, idx) => {
              const isSelected = isSameDay(day, selectedDate);
              const isToday = isSameDay(day, new Date());
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedDate(day)}
                  className="glass"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: '60px',
                    height: '75px',
                    borderRadius: 'var(--radius-md)',
                    border: isSelected ? '2px solid var(--accent-primary)' : '1px solid var(--border-glass)',
                    backgroundColor: isSelected ? 'rgba(255, 153, 51, 0.05)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    flexShrink: 0,
                  }}
                >
                  <span style={{ fontSize: '10px', color: isSelected ? 'var(--accent-primary)' : 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                    {format(day, 'eee')}
                  </span>
                  <span style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--text-primary)', margin: '4px 0' }}>
                    {format(day, 'd')}
                  </span>
                  {isToday && (
                    <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'var(--accent-secondary)' }} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Meal Type Tabs (Lunch / Dinner) */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-glass)', paddingBottom: '1px' }}>
          {['lunch', 'dinner'].map((type) => (
            <button
              key={type}
              onClick={() => setActiveMealTab(type)}
              style={{
                flex: 1,
                padding: '12px 0',
                border: 'none',
                background: 'none',
                borderBottom: activeMealTab === type ? '2px solid var(--accent-primary)' : '2px solid transparent',
                color: activeMealTab === type ? 'var(--accent-primary)' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: 'var(--text-sm)',
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              ☀️ {type}
            </button>
          ))}
        </div>

        {/* Menu Cards */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <LoadingSkeleton type="card" count={1} />
          </div>
        ) : selectedMenu && selectedMenu.items && selectedMenu.items.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {selectedMenu.items.map((item) => (
              <Card key={item._id} className="glass" style={{ padding: '0', overflow: 'hidden' }}>
                {item.image && <img src={item.image} alt={item.name} style={{ width: '100%', height: '180px', objectFit: 'cover' }} />}
                <div style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <Badge variant={item.category}>{item.category.toUpperCase()}</Badge>
                      {item.tags?.map((t) => (
                        <Badge key={t} variant="glass" style={{ fontSize: '10px' }}>{t}</Badge>
                      ))}
                    </div>
                    <h3 style={{ margin: '4px 0 6px 0', fontSize: 'var(--text-lg)', fontWeight: 600 }}>
                      {item.name}
                    </h3>
                    <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      {item.description}
                    </p>
                  </div>
                </div>

                <hr style={{ border: 'none', borderBottom: '1px solid var(--border-glass)', margin: '16px 0' }} />

                {/* Nutritional breakdown */}
                <div>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.5px' }}>
                    NUTRITIONAL PROFILE
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                    
                    {/* Calories */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: 'var(--radius-md)' }}>
                      <Flame size={16} color="var(--accent-primary)" style={{ marginBottom: '6px' }} />
                      <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700 }}>{item.calories}</span>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>kcal</span>
                    </div>

                    {/* Protein */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: 'var(--radius-md)' }}>
                      <Dumbbell size={16} color="var(--success)" style={{ marginBottom: '6px' }} />
                      <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700 }}>{item.protein || 0}g</span>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Protein</span>
                    </div>

                    {/* Carbs */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: 'var(--radius-md)' }}>
                      <Egg size={16} color="var(--info)" style={{ marginBottom: '6px' }} />
                      <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700 }}>{item.carbs || 0}g</span>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Carbs</span>
                    </div>

                    {/* Fats */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: 'var(--radius-md)' }}>
                      <Disc size={16} color="var(--warning)" style={{ marginBottom: '6px' }} />
                      <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700 }}>{item.fat || 0}g</span>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Fats</span>
                    </div>

                  </div>
                </div>
              </div></Card>
            ))}
          </div>
        ) : (
          <div className="glass" style={{ padding: '40px 20px', textAlign: 'center', borderRadius: 'var(--radius-lg)' }}>
            <Calendar size={32} color="var(--text-muted)" style={{ marginBottom: '12px' }} />
            <h3 style={{ margin: '0 0 6px 0', fontSize: 'var(--text-md)', fontWeight: 600 }}>Menu Not Published</h3>
            <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
              Menu for {format(selectedDate, 'do MMMM')} ({activeMealTab}) is not available yet.
            </p>
          </div>
        )}
      </div>
    </PageShell>
  );
};

export default Menu;
