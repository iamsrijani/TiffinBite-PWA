import React, { useEffect, useState } from 'react';
import { menuService } from '../../services/api.js';
import { useUiStore } from '../../store/uiStore.js';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton.jsx';
import { PageShell } from '../../components/layout/PageShell.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { Plus, Edit, Trash2, Calendar, FileText, CheckCircle, HelpCircle } from 'lucide-react';
import { format, addDays } from 'date-fns';

export const MenuManager = () => {
  const { addToast } = useUiStore();
  const [loading, setLoading] = useState(true);
  const [menus, setMenus] = useState([]);
  
  // Modal toggle
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMenu, setEditingMenu] = useState(null);

  // Form states
  const [date, setDate] = useState(format(addDays(new Date(), 1), 'yyyy-MM-dd'));
  const [mealType, setMealType] = useState('lunch');
  
  // Prices (in Rupees)
  const [priceSingle, setPriceSingle] = useState('120');
  const [priceWeekly, setPriceWeekly] = useState('770');
  const [priceMonthly, setPriceMonthly] = useState('3000');

  // Meal item states
  const [itemName, setItemName] = useState('');
  const [itemDesc, setItemDesc] = useState('');
  const [itemCategory, setItemCategory] = useState('veg'); // veg, nonveg, vegan
  const [calories, setCalories] = useState('550');
  const [protein, setProtein] = useState('18');
  const [carbs, setCarbs] = useState('70');
  const [fat, setFat] = useState('12');
  const [tags, setTags] = useState('home-style, light');

  const fetchMenus = async () => {
    setLoading(true);
    try {
      const response = await menuService.getWeeklyMenu();
      if (response.success) {
        setMenus(response.data);
      }
    } catch (err) {
      addToast(err.message || 'Failed to fetch menus.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  const handleOpenAdd = () => {
    setEditingMenu(null);
    setDate(format(addDays(new Date(), 1), 'yyyy-MM-dd'));
    setMealType('lunch');
    setPriceSingle('120');
    setPriceWeekly('770');
    setPriceMonthly('3000');
    
    setItemName('');
    setItemDesc('');
    setItemCategory('veg');
    setCalories('550');
    setProtein('18');
    setCarbs('70');
    setFat('12');
    setTags('home-style, light');
    
    setShowAddModal(true);
  };

  const handlePublish = async (menuId) => {
    try {
      const response = await menuService.publishMenu(menuId);
      if (response.success) {
        addToast('Menu published successfully!', 'success');
        fetchMenus();
      }
    } catch (err) {
      addToast(err.message || 'Failed to publish menu.', 'error');
    }
  };

  const handleDelete = async (menuId) => {
    if (!window.confirm('Delete this daily menu template?')) return;

    try {
      const response = await menuService.deleteMenu(menuId);
      if (response.success) {
        addToast('Menu template deleted.', 'success');
        fetchMenus();
      }
    } catch (err) {
      addToast(err.message || 'Delete failed.', 'error');
    }
  };

  const handleSubmitMenu = async (e) => {
    e.preventDefault();
    
    // Parse tags
    const parsedTags = tags
      ? tags.split(',').map((t) => t.trim()).filter(Boolean)
      : [];

    const payload = {
      date: new Date(date),
      mealType,
      price: {
        single: parseFloat(priceSingle) * 100, // to paise
        weekly: parseFloat(priceWeekly) * 100,
        monthly: parseFloat(priceMonthly) * 100,
      },
      items: [
        {
          name: itemName.trim(),
          description: itemDesc.trim(),
          category: itemCategory,
          calories: parseInt(calories, 10) || 0,
          protein: parseInt(protein, 10) || 0,
          carbs: parseInt(carbs, 10) || 0,
          fat: parseInt(fat, 10) || 0,
          tags: parsedTags,
        }
      ]
    };

    try {
      let response;
      if (editingMenu) {
        response = await menuService.updateMenu(editingMenu._id, payload);
      } else {
        response = await menuService.createMenu(payload);
      }

      if (response.success) {
        addToast(`Menu template ${editingMenu ? 'updated' : 'created'} successfully!`, 'success');
        setShowAddModal(false);
        fetchMenus();
      }
    } catch (err) {
      addToast(err.message || 'Failed to save menu template.', 'error');
    }
  };

  return (
    <PageShell
      title="Menu Manager"
      subtitle="Publish and configure daily meal plans for lunch & dinner schedules"
      action={
        <Button variant="primary" icon={Plus} onClick={handleOpenAdd}>
          Add Daily Menu
        </Button>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {loading ? (
          <LoadingSkeleton type="card" count={2} />
        ) : menus.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {menus.map((menu) => (
              <Card key={menu._id} className="glass" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                  
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <Badge variant="glass" style={{ textTransform: 'uppercase' }}>{menu.mealType}</Badge>
                      <Badge variant={menu.isPublished ? 'veg' : 'nonveg'}>
                        {menu.isPublished ? 'PUBLISHED' : 'DRAFT'}
                      </Badge>
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                        Date: {format(new Date(menu.date), 'eeee, do MMM')}
                      </span>
                    </div>

                    <h4 style={{ margin: '4px 0', fontSize: 'var(--text-md)', fontWeight: 600 }}>
                      {menu.items?.[0]?.name || 'No Items Configured'}
                    </h4>
                    <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                      Pricing plans: Single ₹{(menu.price.single / 100).toFixed(2)} | Weekly ₹{(menu.price.weekly / 100).toFixed(2)}
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    {!menu.isPublished && (
                      <Button
                        variant="outline"
                        size="xs"
                        icon={CheckCircle}
                        onClick={() => handlePublish(menu._id)}
                      >
                        Publish
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="xs"
                      icon={Trash2}
                      style={{ color: 'var(--error)' }}
                      onClick={() => handleDelete(menu._id)}
                    >
                      Delete
                    </Button>
                  </div>

                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="glass" style={{ padding: '32px', textAlign: 'center', borderRadius: 'var(--radius-lg)' }}>
            <Calendar size={32} color="var(--text-muted)" style={{ marginBottom: '12px' }} />
            <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
              No menus configured for the upcoming week.
            </p>
          </div>
        )}

      </div>

      {/* ADD/EDIT MODAL */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={editingMenu ? 'Edit Daily Menu' : 'Configure Daily Menu'}
        size="lg"
      >
        <form onSubmit={handleSubmitMenu} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Grid: Date & Meal type */}
          <div style={{ display: 'flex', gap: '16px' }}>
            <Input
              id="menu-date-input"
              label="Menu Date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{ flex: 1 }}
              required
            />
            <div style={{ flex: 1 }}>
              <span className="input__label" style={{ display: 'block', marginBottom: '8px' }}>Meal Session</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['lunch', 'dinner'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setMealType(type)}
                    className="glass"
                    style={{
                      flex: 1,
                      padding: '8px',
                      borderRadius: 'var(--radius-sm)',
                      border: mealType === type ? '2px solid var(--accent-primary)' : '1px solid var(--border-glass)',
                      color: mealType === type ? 'var(--accent-primary)' : 'var(--text-secondary)',
                      fontWeight: 600,
                      background: 'none',
                      cursor: 'pointer',
                      fontSize: 'var(--text-xs)',
                      textTransform: 'uppercase'
                    }}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Pricing blocks */}
          <div>
            <span className="input__label" style={{ display: 'block', marginBottom: '8px' }}>Pricing Models (Rupees)</span>
            <div style={{ display: 'flex', gap: '12px' }}>
              <Input
                id="price-single"
                label="Single Meal Price"
                placeholder="120"
                value={priceSingle}
                onChange={(e) => setPriceSingle(e.target.value)}
                style={{ flex: 1 }}
                required
              />
              <Input
                id="price-weekly"
                label="Weekly Meal Price"
                placeholder="770"
                value={priceWeekly}
                onChange={(e) => setPriceWeekly(e.target.value)}
                style={{ flex: 1 }}
                required
              />
              <Input
                id="price-monthly"
                label="Monthly Meal Price"
                placeholder="3000"
                value={priceMonthly}
                onChange={(e) => setPriceMonthly(e.target.value)}
                style={{ flex: 1 }}
                required
              />
            </div>
          </div>

          {/* Item details */}
          <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '16px' }}>
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--accent-secondary)', display: 'block', marginBottom: '12px' }}>MEAL ITEM DETAILS</span>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <Input
                id="item-name"
                label="Dish Name"
                placeholder="e.g. Kadhi Pakora & Basmati Rice Combo"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                required
              />
              <Input
                id="item-desc"
                label="Dish Description / Details"
                placeholder="e.g. Traditional Punjabi kadhi with onion pakoras, served with salad & rice."
                value={itemDesc}
                onChange={(e) => setItemDesc(e.target.value)}
              />

              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                {/* Diet category */}
                <div style={{ flex: 1, minWidth: '150px' }}>
                  <span className="input__label" style={{ display: 'block', marginBottom: '6px' }}>Diet Category</span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {['veg', 'nonveg', 'vegan'].map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setItemCategory(cat)}
                        className="glass"
                        style={{
                          flex: 1,
                          padding: '6px',
                          borderRadius: 'var(--radius-sm)',
                          border: itemCategory === cat ? '2px solid var(--accent-primary)' : '1px solid var(--border-glass)',
                          color: itemCategory === cat ? 'var(--accent-primary)' : 'var(--text-secondary)',
                          fontSize: '10px',
                          fontWeight: 600,
                          background: 'none',
                          cursor: 'pointer',
                          textTransform: 'uppercase'
                        }}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                <Input
                  id="item-tags"
                  label="Tags (comma-separated)"
                  placeholder="high-protein, low-carb"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  style={{ flex: 1.5, minWidth: '200px' }}
                />
              </div>

              {/* Nutrition */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                <Input
                  id="item-cals"
                  label="Calories"
                  placeholder="550"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                />
                <Input
                  id="item-protein"
                  label="Protein (g)"
                  placeholder="18"
                  value={protein}
                  onChange={(e) => setProtein(e.target.value)}
                />
                <Input
                  id="item-carbs"
                  label="Carbs (g)"
                  placeholder="70"
                  value={carbs}
                  onChange={(e) => setCarbs(e.target.value)}
                />
                <Input
                  id="item-fats"
                  label="Fats (g)"
                  placeholder="12"
                  value={fat}
                  onChange={(e) => setFat(e.target.value)}
                />
              </div>

            </div>
          </div>

          <Button
            id="btn-save-menu-item"
            type="submit"
            variant="primary"
            fullWidth
          >
            Create Daily Menu Template
          </Button>

        </form>
      </Modal>

    </PageShell>
  );
};

export default MenuManager;
