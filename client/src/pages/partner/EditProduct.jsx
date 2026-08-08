import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchProductById, updateProduct, uploadProductImages } from '../../services/productService';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import VendorSidebar from '../../components/layout/VendorSidebar';
import { useToast } from '../../context/ToastContext';
import { 
  ArrowLeft, 
  Upload, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  Check 
} from 'lucide-react';

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Electronics & Tech',
    description: '',
    pricePerDay: '',
    securityDeposit: '',
    lateFee: '',
    availableQuantity: '1',
    condition: 'new',
    location: '',
  });

  // State holding image items: [{ file?: File, url: string, isCover: boolean, isExisting: boolean }]
  const [imageItems, setImageItems] = useState([]);

  useEffect(() => {
    loadProductDetails();
  }, [id]);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    const backendBase = 'http://localhost:5000';
    return `${backendBase}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  };

  const getCleanPath = (imageUrl) => {
    const backendBase = 'http://localhost:5000';
    if (imageUrl.startsWith(backendBase)) {
      return imageUrl.replace(backendBase, '');
    }
    return imageUrl;
  };

  const loadProductDetails = async () => {
    setFetching(true);
    try {
      const data = await fetchProductById(id);
      if (data) {
        setFormData({
          title: data.title || data.name || '',
          category: data.category?.name || data.category || 'Electronics & Tech',
          description: data.description || '',
          pricePerDay: String(data.pricePerDay || data.price || ''),
          securityDeposit: String(data.securityDeposit || data.deposit || ''),
          lateFee: String(data.lateFee || 10),
          availableQuantity: String(data.availableQuantity || data.quantity || 1),
          condition: data.condition || 'new',
          location: data.location || '',
        });

        // Initialize images
        const existingImages = data.images && data.images.length > 0 
          ? data.images 
          : (data.image ? [data.image] : []);

        const initialItems = existingImages.map((path, idx) => ({
          url: getImageUrl(path),
          isCover: idx === 0,
          isExisting: true
        }));

        setImageItems(initialItems);
      }
    } catch (e) {
      toast.error('Failed to load product details.');
      navigate('/partner/products');
    } finally {
      setFetching(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (imageItems.length + files.length > 1) {
      toast.error('You can upload a maximum of 1 image.');
      return;
    }

    const newItems = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
      isCover: false,
      isExisting: false
    }));

    const hasCover = imageItems.some(item => item.isCover);
    if (!hasCover && newItems.length > 0) {
      newItems[0].isCover = true;
    }

    setImageItems([...imageItems, ...newItems]);
  };

  const handleRemoveImage = (index) => {
    const removed = imageItems[index];
    const updated = imageItems.filter((_, i) => i !== index);

    if (removed.isCover && updated.length > 0) {
      updated[0].isCover = true;
    }

    setImageItems(updated);
  };

  const handleSetCover = (index) => {
    const updated = imageItems.map((item, i) => ({
      ...item,
      isCover: i === index
    }));
    setImageItems(updated);
  };

  const handleMoveImage = (index, direction) => {
    if (direction === 'left' && index === 0) return;
    if (direction === 'right' && index === imageItems.length - 1) return;

    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    const updated = [...imageItems];
    
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    setImageItems(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (imageItems.length === 0) {
      toast.error('Please upload at least 1 image.');
      return;
    }

    setLoading(true);
    try {
      // 1. Filter out new files to upload
      const newFiles = imageItems.filter(item => !item.isExisting).map(item => item.file);
      
      let uploadedPaths = [];
      if (newFiles.length > 0) {
        const uploadForm = new FormData();
        newFiles.forEach(file => uploadForm.append('images', file));
        const uploadRes = await uploadProductImages(uploadForm);
        uploadedPaths = uploadRes?.filePaths || [];
        if (!uploadedPaths || uploadedPaths.length === 0) {
          throw new Error('New image upload failed');
        }
      }

      // 2. Map mixed array back to paths
      let uploadIndex = 0;
      const finalPaths = imageItems.map(item => {
        if (item.isExisting) {
          return getCleanPath(item.url);
        } else {
          const path = uploadedPaths[uploadIndex];
          uploadIndex += 1;
          return path;
        }
      });

      // Move cover path to front
      const coverIndex = imageItems.findIndex(item => item.isCover);
      if (coverIndex > 0) {
        const coverPath = finalPaths[coverIndex];
        finalPaths.splice(coverIndex, 1);
        finalPaths.unshift(coverPath);
      }

      const payload = {
        ...formData,
        pricePerDay: Number(formData.pricePerDay),
        securityDeposit: Number(formData.securityDeposit),
        lateFee: Number(formData.lateFee || 10),
        availableQuantity: Number(formData.availableQuantity),
        images: finalPaths,
        image: finalPaths[0]
      };

      await updateProduct(id, payload);
      toast.success('Equipment listing updated successfully!');
      navigate('/partner/products');
    } catch (err) {
      toast.error(err.message || 'Failed to update listing');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="app-container">
        <Navbar />
        <div style={{ display: 'flex', minHeight: 'calc(100vh - 80px)' }}>
          <VendorSidebar />
          <main style={{ flex: 1, padding: '32px', background: 'var(--bg-color)' }}>
            <div className="skeleton" style={{ height: '500px', borderRadius: '16px' }} />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Navbar />
      <div style={{ display: 'flex', minHeight: 'calc(100vh - 80px)' }}>
        <VendorSidebar />
        
        <main style={{ flex: 1, padding: '32px', background: 'var(--bg-color)', overflowY: 'auto' }}>
          <div className="partner-dash-container" style={{ maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button onClick={() => navigate('/partner/products')} className="btn btn-secondary btn-sm" style={{ padding: '8px' }}>
                <ArrowLeft size={16} />
              </button>
              <h2 style={{ margin: 0 }}>Edit Equipment Details</h2>
            </div>

            <form onSubmit={handleSubmit} className="glass-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label>Equipment Title / Model Name *</label>
                  <input 
                    type="text" 
                    name="title" 
                    placeholder="e.g. RED Komodo 6K Cinema Camera Kit"
                    value={formData.title} 
                    onChange={handleInputChange} 
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>Category *</label>
                  <select name="category" value={formData.category} onChange={handleInputChange} required>
                    <option value="Electronics & Tech">Electronics & Tech</option>
                    <option value="Vehicles">Vehicles</option>
                    <option value="Gaming">Gaming</option>
                    <option value="Gym & Fitness">Gym & Fitness</option>
                    <option value="Apparel & Clothes">Apparel & Clothes</option>
                    <option value="Home & Furniture">Home & Furniture</option>
                    <option value="Tools & Hardware">Tools & Hardware</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Equipment Condition *</label>
                  <select name="condition" value={formData.condition} onChange={handleInputChange} required>
                    <option value="new">Brand New</option>
                    <option value="like-new">Like New (Mint)</option>
                    <option value="good">Good (Normal wear)</option>
                    <option value="fair">Fair (Visible scuffs)</option>
                  </select>
                </div>

                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label>Product Description & Technical Specifications *</label>
                  <textarea 
                    name="description" 
                    rows="5"
                    placeholder="Enter specs, inclusions and usage guidelines..."
                    value={formData.description} 
                    onChange={handleInputChange} 
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>Rental Price Per Day (₹) *</label>
                  <input 
                    type="number" 
                    name="pricePerDay" 
                    placeholder="₹500" 
                    min="1"
                    value={formData.pricePerDay} 
                    onChange={handleInputChange} 
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>Security Deposit (₹) *</label>
                  <input 
                    type="number" 
                    name="securityDeposit" 
                    placeholder="₹2,000" 
                    min="0"
                    value={formData.securityDeposit} 
                    onChange={handleInputChange} 
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>Late Fee Charge (₹/Day)</label>
                  <input 
                    type="number" 
                    name="lateFee" 
                    placeholder="₹100" 
                    min="0"
                    value={formData.lateFee} 
                    onChange={handleInputChange} 
                  />
                </div>

                <div className="form-group">
                  <label>Available Quantity *</label>
                  <input 
                    type="number" 
                    name="availableQuantity" 
                    placeholder="1" 
                    min="1"
                    value={formData.availableQuantity} 
                    onChange={handleInputChange} 
                    required 
                  />
                </div>

                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label>Storage Location (Area/City) *</label>
                  <input 
                    type="text" 
                    name="location" 
                    placeholder="e.g. Koramangala, Bangalore"
                    value={formData.location} 
                    onChange={handleInputChange} 
                    required 
                  />
                </div>
              </div>

              {/* Multiple Image Upload Box */}
              <div className="form-group" style={{ borderTop: '1px solid var(--surface-border)', paddingTop: '20px' }}>
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Upload Image (1 file) *</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{imageItems.length}/1 uploaded</span>
                </label>
                
                {imageItems.length < 1 && (
                  <div style={{ border: '2px dashed var(--surface-border)', borderRadius: '12px', padding: '32px', textAlign: 'center', cursor: 'pointer', background: 'rgba(255, 102, 0, 0.02)', position: 'relative' }}>
                    <input 
                      type="file" 
                      multiple 
                      accept="image/*"
                      onChange={handleFileChange}
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                    />
                    <Upload size={32} style={{ color: 'var(--primary-color)', marginBottom: '8px' }} />
                    <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: '600' }}>Click or Drag files to upload</p>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Select new images to add to the gallery</span>
                  </div>
                )}

                {/* Previews List */}
                {imageItems.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '16px', marginTop: '16px' }}>
                    {imageItems.map((item, index) => (
                      <div key={index} className="glass-card" style={{ position: 'relative', height: '130px', borderRadius: '12px', overflow: 'hidden', border: item.isCover ? '2px solid var(--primary-color)' : '1px solid var(--surface-border)' }}>
                        <img 
                          src={item.url} 
                          alt="preview" 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '4px 0', zIndex: 10 }}>
                          
                          <button 
                            type="button" 
                            disabled={index === 0} 
                            onClick={() => handleMoveImage(index, 'left')}
                            style={{ background: 'none', border: 'none', color: index === 0 ? 'rgba(255,255,255,0.3)' : 'white', cursor: 'pointer', padding: '2px' }}
                          >
                            <ChevronLeft size={14} />
                          </button>

                          <button 
                            type="button" 
                            onClick={() => handleSetCover(index)}
                            style={{ background: 'none', border: 'none', color: item.isCover ? 'var(--primary-color)' : 'white', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}
                            title="Set Cover"
                          >
                            <Check size={14} />
                          </button>

                          <button 
                            type="button" 
                            onClick={() => handleRemoveImage(index)}
                            style={{ background: 'none', border: 'none', color: 'var(--color-danger)', cursor: 'pointer', padding: '2px' }}
                            title="Remove"
                          >
                            <Trash2 size={14} />
                          </button>

                          <button 
                            type="button" 
                            disabled={index === imageItems.length - 1} 
                            onClick={() => handleMoveImage(index, 'right')}
                            style={{ background: 'none', border: 'none', color: index === imageItems.length - 1 ? 'rgba(255,255,255,0.3)' : 'white', cursor: 'pointer', padding: '2px' }}
                          >
                            <ChevronRight size={14} />
                          </button>

                        </div>

                        {item.isCover && (
                          <span style={{ position: 'absolute', top: '4px', left: '4px', background: 'var(--primary-gradient)', color: 'white', fontSize: '9px', fontWeight: 'bold', padding: '2px 6px', borderRadius: '8px' }}>
                            Cover
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid var(--surface-border)', paddingTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => navigate('/partner/products')} disabled={loading}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Saving Changes...' : 'Save Changes'}
                </button>
              </div>

            </form>

          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default EditProduct;
