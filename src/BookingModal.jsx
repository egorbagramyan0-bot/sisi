import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Calendar, Users, Clock, Phone, User } from 'lucide-react';

const BookingModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    date: '',
    time: '19:00',
    guests: '2',
  });
  
  const [status, setStatus] = useState('idle'); // 'idle' | 'submitting' | 'success'
  const [errors, setErrors] = useState({});

  const validate = () => {
    const tempErrors = {};
    if (!formData.name.trim()) tempErrors.name = 'Пожалуйста, введите ваше имя';
    if (!formData.phone.trim()) {
      tempErrors.phone = 'Пожалуйста, введите номер телефона';
    } else if (!/^\+?[0-9\s-]{10,18}$/.test(formData.phone)) {
      tempErrors.phone = 'Некорректный формат телефона';
    }
    if (!formData.date) tempErrors.date = 'Выберите дату';
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    setStatus('submitting');
    
    // Simulate API request to book a table
    setTimeout(() => {
      setStatus('success');
    }, 1500);
  };

  const handleReset = () => {
    setFormData({
      name: '',
      phone: '',
      date: '',
      time: '19:00',
      guests: '2',
    });
    setStatus('idle');
    setErrors({});
    onClose();
  };

  // Prevent click propagation from modal to backdrop
  const handleContentClick = (e) => {
    e.stopPropagation();
  };

  // Helper for tomorrow's date (min date in datepicker)
  const getTodayDateString = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="modal-content"
            initial={{ y: 50, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 30, opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            onClick={handleContentClick}
          >
            <button className="modal-close-btn" onClick={onClose} aria-label="Закрыть">
              <X size={20} />
            </button>

            {status !== 'success' ? (
              <>
                <div className="modal-header">
                  <h3 className="modal-title">Забронировать стол</h3>
                  <p className="modal-subtitle">Заполните форму, и&nbsp;мы&nbsp;подтвердим вашу бронь в&nbsp;течение 5&nbsp;минут</p>
                </div>

                <form className="booking-form" onSubmit={handleSubmit}>
                  <div className="modal-body">
                    {/* Name Input */}
                    <div className="form-group">
                      <label className="form-label" htmlFor="booking-name">Имя</label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type="text"
                          id="booking-name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className="form-input"
                          placeholder="Александр"
                          style={{ width: '100%', paddingLeft: '40px' }}
                          disabled={status === 'submitting'}
                        />
                        <User size={16} className="contact-icon" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', opacity: 0.6 }} />
                      </div>
                      {errors.name && <span style={{ color: 'var(--accent-terracotta)', fontSize: '11px', fontWeight: '500' }}>{errors.name}</span>}
                    </div>

                    {/* Phone Input */}
                    <div className="form-group">
                      <label className="form-label" htmlFor="booking-phone">Телефон</label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type="tel"
                          id="booking-phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="form-input"
                          placeholder="+7 (999) 999-99-99"
                          style={{ width: '100%', paddingLeft: '40px' }}
                          disabled={status === 'submitting'}
                        />
                        <Phone size={16} className="contact-icon" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', opacity: 0.6 }} />
                      </div>
                      {errors.phone && <span style={{ color: 'var(--accent-terracotta)', fontSize: '11px', fontWeight: '500' }}>{errors.phone}</span>}
                    </div>

                    {/* Date & Time Row */}
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label" htmlFor="booking-date">Дата</label>
                        <div style={{ position: 'relative' }}>
                          <input
                            type="date"
                            id="booking-date"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            className="form-input"
                            min={getTodayDateString()}
                            style={{ width: '100%', paddingLeft: '40px' }}
                            disabled={status === 'submitting'}
                          />
                          <Calendar size={16} className="contact-icon" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', opacity: 0.6 }} />
                        </div>
                        {errors.date && <span style={{ color: 'var(--accent-terracotta)', fontSize: '11px', fontWeight: '500' }}>{errors.date}</span>}
                      </div>

                      <div className="form-group">
                        <label className="form-label" htmlFor="booking-time">Время</label>
                        <div style={{ position: 'relative' }}>
                          <select
                            id="booking-time"
                            name="time"
                            value={formData.time}
                            onChange={handleChange}
                            className="form-input"
                            style={{ width: '100%', paddingLeft: '40px', appearance: 'none', WebkitAppearance: 'none' }}
                            disabled={status === 'submitting'}
                          >
                            <option value="10:00">10:00</option>
                            <option value="11:00">11:00</option>
                            <option value="12:00">12:00</option>
                            <option value="13:00">13:00</option>
                            <option value="14:00">14:00</option>
                            <option value="15:00">15:00</option>
                            <option value="16:00">16:00</option>
                            <option value="17:00">17:00</option>
                            <option value="18:00">18:00</option>
                            <option value="19:00">19:00</option>
                            <option value="20:00">20:00</option>
                            <option value="21:00">21:00</option>
                            <option value="22:00">22:00</option>
                          </select>
                          <Clock size={16} className="contact-icon" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', opacity: 0.6 }} />
                        </div>
                      </div>
                    </div>

                    {/* Guests Input */}
                    <div className="form-group">
                      <label className="form-label" htmlFor="booking-guests">Количество гостей</label>
                      <div style={{ position: 'relative' }}>
                        <select
                          id="booking-guests"
                          name="guests"
                          value={formData.guests}
                          onChange={handleChange}
                          className="form-input"
                          style={{ width: '100%', paddingLeft: '40px', appearance: 'none', WebkitAppearance: 'none' }}
                          disabled={status === 'submitting'}
                        >
                          <option value="1">1 гость</option>
                          <option value="2">2 гостя</option>
                          <option value="3">3 гостя</option>
                          <option value="4">4 гостя</option>
                          <option value="5">5 гостей</option>
                          <option value="6">6 гостей</option>
                          <option value="7">7 гостей</option>
                          <option value="8">8+ гостей</option>
                        </select>
                        <Users size={16} className="contact-icon" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', opacity: 0.6 }} />
                      </div>
                    </div>
                  </div>

                  <div className="modal-footer">
                    <button 
                      type="submit" 
                      className="btn btn-dark" 
                      style={{ width: '100%', height: '48px' }}
                      disabled={status === 'submitting'}
                    >
                      {status === 'submitting' ? (
                        <div className="spinner" style={{ 
                          width: '20px', 
                          height: '20px', 
                          border: '2px solid rgba(255,255,255,0.3)', 
                          borderTopColor: '#fff', 
                          borderRadius: '50%', 
                          animation: 'spin 0.8s linear infinite'
                        }} />
                      ) : 'Забронировать стол'}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="modal-body success-body-wrap">
                <motion.div 
                  className="booking-success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="success-icon-wrapper">
                    <Check size={32} />
                  </div>
                  <h3 className="success-title">Стол забронирован!</h3>
                  <p className="success-body">
                    Спасибо, <strong>{formData.name}</strong>!<br />
                    Мы&nbsp;ждем вас <strong>{new Date(formData.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}</strong> в&nbsp;<strong>{formData.time}</strong>.<br />
                    Количество гостей: <strong>{formData.guests}</strong>.<br /><br />
                    В&nbsp;ближайшие 5&nbsp;минут мы&nbsp;отправим вам&nbsp;SMS-подтверждение на&nbsp;номер <strong>{formData.phone}</strong>.
                  </p>
                  <button 
                    onClick={handleReset} 
                    className="btn btn-dark" 
                    style={{ width: '100%' }}
                  >
                    Отлично
                  </button>
                </motion.div>
              </div>
            )}
          </motion.div>

          {/* Inline styling helper for spinners */}
          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BookingModal;
