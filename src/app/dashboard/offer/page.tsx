// 'use client';
// import React, { useState, useEffect } from 'react';
// import { Plus, Edit, Trash2, Calendar, Percent, Upload, X } from 'lucide-react';
// import Image from 'next/image';

// const OffersManagement = () => {
//     const [offers, setOffers] = useState([]);
//     const [isLoading, setIsLoading] = useState(true);
//     const [showCreateModal, setShowCreateModal] = useState(false);
//     const [selectedImage, setSelectedImage] = useState(null);
//     const [imagePreview, setImagePreview] = useState('');
//     const [isSubmitting, setIsSubmitting] = useState(false);
//     const [formData, setFormData] = useState({
//         title: '',
//         description: '',
//         discountPercentage: '',
//         validFrom: '',
//         validTo: '',
//         isActive: true
//     });

//     // Fetch offers
//     const fetchOffers = async () => {
//         try {
//             const response = await fetch('/api/admin/offer', {
//                 headers: {
//                     'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
//                 }
//             });

//             if (response.ok) {
//                 const data = await response.json();
//                 setOffers(data.offer || []);
//             } else {
//                 console.error('Failed to fetch offers');
//             }
//         } catch (error) {
//             console.error('Error fetching offers:', error);
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     useEffect(() => {
//         fetchOffers();
//     }, []);

//     // Handle form input changes
//     const handleInputChange = (e) => {
//         const { name, value, type, checked } = e.target;
//         setFormData(prev => ({
//             ...prev,
//             [name]: type === 'checkbox' ? checked : value
//         }));
//     };

//     // Handle image selection
//     const handleImageSelect = (e) => {
//         const file = e.target.files[0];
//         if (file) {
//             if (file.size > 4 * 1024 * 1024) {
//                 alert('Image too large (max 4MB)');
//                 return;
//             }
//             setSelectedImage(file);
//             const reader = new FileReader();
//             reader.onload = (e) => setImagePreview(e.target.result);
//             reader.readAsDataURL(file);
//         }
//     };

//     // Create new offer
//     const handleCreateOffer = async () => {
//         if (!formData.title || !formData.description || !formData.discountPercentage) {
//             alert('Please fill in all required fields');
//             return;
//         }

//         setIsSubmitting(true);

//         try {
//             const formDataToSend = new FormData();
//             formDataToSend.append('title', formData.title);
//             formDataToSend.append('description', formData.description);
//             formDataToSend.append('discountPercentage', formData.discountPercentage);
//             formDataToSend.append('validFrom', formData.validFrom);
//             formDataToSend.append('validTo', formData.validTo);
//             formDataToSend.append('isActive', formData.isActive.toString());

//             if (selectedImage) {
//                 formDataToSend.append('image', selectedImage);
//             }

//             const response = await fetch('/api/admin/offer', {
//                 method: 'POST',
//                 headers: {
//                     'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
//                 },
//                 body: formDataToSend
//             });

//             if (response.ok) {
//                 const data = await response.json();
//                 setOffers(prev => [...prev, data.offer]);
//                 resetForm();
//                 setShowCreateModal(false);
//             } else {
//                 const error = await response.json();
//                 alert(error.message || 'Failed to create offer');
//             }
//         } catch (error) {
//             console.error('Error creating offer:', error);
//             alert('Failed to create offer');
//         } finally {
//             setIsSubmitting(false);
//         }
//     };

//     // Delete offer
//     const handleDeleteOffer = async (offerId) => {
//         if (!confirm('Are you sure you want to delete this offer?')) return;

//         try {
//             const response = await fetch('/api/admin/offer', {
//                 method: 'DELETE',
//                 headers: {
//                     'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify({ id: offerId })
//             });

//             if (response.ok) {
//                 setOffers(prev => prev.filter(offer => offer._id !== offerId));
//             } else {
//                 const error = await response.json();
//                 alert(error.message || 'Failed to delete offer');
//             }
//         } catch (error) {
//             console.error('Error deleting offer:', error);
//             alert('Failed to delete offer');
//         }
//     };

//     // Reset form
//     const resetForm = () => {
//         setFormData({
//             title: '',
//             description: '',
//             discountPercentage: '',
//             validFrom: '',
//             validTo: '',
//             isActive: true
//         });
//         setSelectedImage(null);
//         setImagePreview('');
//     };

//     // Format date
//     const formatDate = (dateString) => {
//         return new Date(dateString).toLocaleDateString('en-US', {
//             year: 'numeric',
//             month: 'short',
//             day: 'numeric'
//         });
//     };

//     if (isLoading) {
//         return (
//             <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//                 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//             </div>
//         );
//     }

//     return (
//         <div className="min-h-screen bg-gray-50 p-6">
//             <div className="max-w-7xl mx-auto">
//                 {/* Header */}
//                 <div className="mb-8">
//                     <div className="flex justify-between items-center">
//                         <div>
//                             <h1 className="text-3xl font-bold text-gray-900">Offers Management</h1>
//                             <p className="text-gray-600 mt-2">Manage your promotional offers and discounts</p>
//                         </div>
//                         <button
//                             onClick={() => setShowCreateModal(true)}
//                             className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
//                         >
//                             <Plus className="w-5 h-5" />
//                             Create Offer
//                         </button>
//                     </div>
//                 </div>

//                 {/* Offers Grid */}
//                 {offers.length === 0 ? (
//                     <div className="text-center py-12">
//                         <div className="w-24 h-24 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
//                             <Percent className="w-12 h-12 text-gray-400" />
//                         </div>
//                         <h3 className="text-xl font-medium text-gray-900 mb-2">No offers yet</h3>
//                         <p className="text-gray-600 mb-6">Get started by creating your first promotional offer</p>
//                         <button
//                             onClick={() => setShowCreateModal(true)}
//                             className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
//                         >
//                             Create Your First Offer
//                         </button>
//                     </div>
//                 ) : (
//                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                         {offers.map((offer) => (
//                             <div key={offer._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
//                                 {offer.offerImageUrl && (
//                                     <div className="h-48 bg-gray-100 overflow-hidden">
//                                         <Image
//                                         width={500}
//                                         height={300}
//                                             src={offer.offerImageUrl}
//                                             alt={offer.title}
//                                             className="w-full h-full object-cover"
//                                         />
//                                     </div>
//                                 )}
//                                 <div className="p-6">
//                                     <div className="flex justify-between items-start mb-3">
//                                         <h3 className="text-xl font-semibold text-gray-900 line-clamp-2">{offer.title}</h3>
//                                         <div className="flex gap-2">
//                                             <button
//                                                 onClick={() => handleDeleteOffer(offer._id)}
//                                                 className="text-red-500 hover:text-red-700 p-1"
//                                             >
//                                                 <Trash2 className="w-5 h-5" />
//                                             </button>
//                                         </div>
//                                     </div>

//                                     <p className="text-gray-600 mb-4 line-clamp-3">{offer.description}</p>

//                                     <div className="space-y-2 mb-4">
//                                         <div className="flex items-center gap-2">
//                                             <Percent className="w-4 h-4 text-green-600" />
//                                             <span className="text-2xl font-bold text-green-600">{offer.discountPercentage}%</span>
//                                             <span className="text-gray-500">OFF</span>
//                                         </div>

//                                         <div className="flex items-center gap-2 text-sm text-gray-500">
//                                             <Calendar className="w-4 h-4" />
//                                             <span>{formatDate(offer.validFrom)} - {formatDate(offer.validTo)}</span>
//                                         </div>
//                                     </div>

//                                     <div className="flex justify-between items-center">
//                                         <span className={`px-3 py-1 rounded-full text-xs font-medium ${offer.isActive
//                                                 ? 'bg-green-100 text-green-800'
//                                                 : 'bg-gray-100 text-gray-800'
//                                             }`}>
//                                             {offer.isActive ? 'Active' : 'Inactive'}
//                                         </span>

//                                         <div className="text-xs text-gray-500">
//                                             {new Date(offer.validTo) > new Date() ? 'Valid' : 'Expired'}
//                                         </div>
//                                     </div>
//                                 </div>
//                             </div>
//                         ))}
//                     </div>
//                 )}

//                 {/* Create Offer Modal */}
//                 {showCreateModal && (
//                     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//                         <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
//                             <div className="p-6 border-b border-gray-200">
//                                 <div className="flex justify-between items-center">
//                                     <h2 className="text-2xl font-bold text-gray-900">Create New Offer</h2>
//                                     <button
//                                         onClick={() => {
//                                             setShowCreateModal(false);
//                                             resetForm();
//                                         }}
//                                         className="text-gray-400 hover:text-gray-600"
//                                     >
//                                         <X className="w-6 h-6" />
//                                     </button>
//                                 </div>
//                             </div>

//                             <div className="p-6 space-y-6">
//                                 {/* Image Upload */}
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                                         Offer Image
//                                     </label>
//                                     <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
//                                         {imagePreview ? (
//                                             <div className="relative">
//                                                 <Image 
//                                                 width={500}
//                                                 height={300}
//                                                     src={imagePreview}
//                                                     alt="Preview"
//                                                     className="w-full h-48 object-cover rounded-lg"
//                                                 />
//                                                 <button
//                                                     type="button"
//                                                     onClick={() => {
//                                                         setSelectedImage(null);
//                                                         setImagePreview('');
//                                                     }}
//                                                     className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
//                                                 >
//                                                     <X className="w-4 h-4" />
//                                                 </button>
//                                             </div>
//                                         ) : (
//                                             <div className="text-center">
//                                                 <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
//                                                 <p className="text-gray-600 mb-2">Click to upload image</p>
//                                                 <p className="text-xs text-gray-500">Max size: 4MB</p>
//                                                 <input
//                                                     type="file"
//                                                     accept="image/*"
//                                                     onChange={handleImageSelect}
//                                                     className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
//                                                 />
//                                             </div>
//                                         )}
//                                     </div>
//                                 </div>

//                                 {/* Title */}
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                                         Title *
//                                     </label>
//                                     <input
//                                         type="text"
//                                         name="title"
//                                         value={formData.title}
//                                         onChange={handleInputChange}
//                                         required
//                                         className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                                         placeholder="Enter offer title"
//                                     />
//                                 </div>

//                                 {/* Description */}
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                                         Description *
//                                     </label>
//                                     <textarea
//                                         name="description"
//                                         value={formData.description}
//                                         onChange={handleInputChange}
//                                         required
//                                         rows={4}
//                                         className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                                         placeholder="Enter offer description"
//                                     />
//                                 </div>

//                                 {/* Discount Percentage */}
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                                         Discount Percentage *
//                                     </label>
//                                     <input
//                                         type="number"
//                                         name="discountPercentage"
//                                         value={formData.discountPercentage}
//                                         onChange={handleInputChange}
//                                         required
//                                         min="1"
//                                         max="100"
//                                         className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                                         placeholder="Enter discount percentage"
//                                     />
//                                 </div>

//                                 {/* Valid From and To */}
//                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                                     <div>
//                                         <label className="block text-sm font-medium text-gray-700 mb-2">
//                                             Valid From
//                                         </label>
//                                         <input
//                                             type="date"
//                                             name="validFrom"
//                                             value={formData.validFrom}
//                                             onChange={handleInputChange}
//                                             className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                                         />
//                                     </div>
//                                     <div>
//                                         <label className="block text-sm font-medium text-gray-700 mb-2">
//                                             Valid To
//                                         </label>
//                                         <input
//                                             type="date"
//                                             name="validTo"
//                                             value={formData.validTo}
//                                             onChange={handleInputChange}
//                                             className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                                         />
//                                     </div>
//                                 </div>

//                                 {/* Is Active */}
//                                 <div className="flex items-center">
//                                     <input
//                                         type="checkbox"
//                                         name="isActive"
//                                         checked={formData.isActive}
//                                         onChange={handleInputChange}
//                                         className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
//                                     />
//                                     <label className="ml-2 text-sm font-medium text-gray-700">
//                                         Make this offer active immediately
//                                     </label>
//                                 </div>

//                                 {/* Submit Button */}
//                                 <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
//                                     <button
//                                         type="button"
//                                         onClick={() => {
//                                             setShowCreateModal(false);
//                                             resetForm();
//                                         }}
//                                         className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
//                                     >
//                                         Cancel
//                                     </button>
//                                     <button
//                                         type="button"
//                                         onClick={handleCreateOffer}
//                                         disabled={isSubmitting}
//                                         className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
//                                     >
//                                         {isSubmitting ? (
//                                             <>
//                                                 <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
//                                                 Creating...
//                                             </>
//                                         ) : (
//                                             'Create Offer'
//                                         )}
//                                     </button>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default OffersManagement;





'use client';

import React, { useState, useEffect, ChangeEvent } from 'react';
import { Plus,  Trash2, Calendar, Percent, Upload, X } from 'lucide-react';
import Image from 'next/image';

// Type definitions
interface Offer {
    _id: string;
    title: string;
    description: string;
    discountPercentage: number;
    validFrom: string;
    validTo: string;
    isActive: boolean;
    offerImageUrl?: string;
    public_id?: string;
    createdAt?: string;
    updatedAt?: string;
}

interface FormData {
    title: string;
    description: string;
    discountPercentage: string;
    validFrom: string;
    validTo: string;
    isActive: boolean;
}

interface ApiResponse {
    offer?: Offer | Offer[];
    message?: string;
    error?: string;
}

interface ApiError {
    message: string;
    error?: string;
}

const OffersManagement: React.FC = () => {
    const [offers, setOffers] = useState<Offer[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [formData, setFormData] = useState<FormData>({
        title: '',
        description: '',
        discountPercentage: '',
        validFrom: '',
        validTo: '',
        isActive: true
    });

    // Fetch offers
    const fetchOffers = async (): Promise<void> => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/admin/offer', {
                headers: {
                    'Authorization': `Bearer ${token || ''}`,
                }
            });

            if (response.ok) {
                const data: ApiResponse = await response.json();
                const offersArray = Array.isArray(data.offer) ? data.offer : data.offer ? [data.offer] : [];
                setOffers(offersArray);
            } else {
                console.error('Failed to fetch offers');
            }
        } catch (error) {
            console.error('Error fetching offers:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOffers();
    }, []);

    // Handle form input changes
    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
        const target = e.target as HTMLInputElement;
        const { name, value, type, checked } = target;

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Handle image selection
    const handleImageSelect = (e: ChangeEvent<HTMLInputElement>): void => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 4 * 1024 * 1024) {
                alert('Image too large (max 4MB)');
                return;
            }
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onload = (e: ProgressEvent<FileReader>) => {
                if (e.target?.result) {
                    setImagePreview(e.target.result as string);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    // Create new offer
    const handleCreateOffer = async (): Promise<void> => {
        if (!formData.title || !formData.description || !formData.discountPercentage) {
            alert('Please fill in all required fields');
            return;
        }

        setIsSubmitting(true);

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('title', formData.title);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('discountPercentage', formData.discountPercentage);
            formDataToSend.append('validFrom', formData.validFrom);
            formDataToSend.append('validTo', formData.validTo);
            formDataToSend.append('isActive', formData.isActive.toString());

            if (selectedImage) {
                formDataToSend.append('image', selectedImage);
            }

            const token = localStorage.getItem('token');
            const response = await fetch('/api/admin/offer', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token || ''}`,
                },
                body: formDataToSend
            });

            if (response.ok) {
                const data: ApiResponse = await response.json();
                if (data.offer && !Array.isArray(data.offer)) {
                    setOffers(prev => [...prev, data.offer as Offer]);
                }
                resetForm();
                setShowCreateModal(false);
            } else {
                const error: ApiError = await response.json();
                alert(error.message || 'Failed to create offer');
            }
        } catch (error) {
            console.error('Error creating offer:', error);
            alert('Failed to create offer');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Delete offer
    const handleDeleteOffer = async (offerId: string): Promise<void> => {
        if (!confirm('Are you sure you want to delete this offer?')) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/admin/offer', {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token || ''}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: offerId })
            });

            if (response.ok) {
                setOffers(prev => prev.filter(offer => offer._id !== offerId));
            } else {
                const error: ApiError = await response.json();
                alert(error.message || 'Failed to delete offer');
            }
        } catch (error) {
            console.error('Error deleting offer:', error);
            alert('Failed to delete offer');
        }
    };

    // Reset form
    const resetForm = (): void => {
        setFormData({
            title: '',
            description: '',
            discountPercentage: '',
            validFrom: '',
            validTo: '',
            isActive: true
        });
        setSelectedImage(null);
        setImagePreview('');
    };

    // Format date
    const formatDate = (dateString: string): string => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Check if offer is expired
    const isOfferExpired = (validTo: string): boolean => {
        return new Date(validTo) <= new Date();
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Offers Management</h1>
                            <p className="text-gray-600 mt-2">Manage your promotional offers and discounts</p>
                        </div>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
                            type="button"
                        >
                            <Plus className="w-5 h-5" />
                            Create Offer
                        </button>
                    </div>
                </div>

                {/* Offers Grid */}
                {offers.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-24 h-24 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                            <Percent className="w-12 h-12 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-medium text-gray-900 mb-2">No offers yet</h3>
                        <p className="text-gray-600 mb-6">Get started by creating your first promotional offer</p>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
                            type="button"
                        >
                            Create Your First Offer
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {offers.map((offer: Offer) => (
                            <div
                                key={offer._id}
                                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                            >
                                {offer.offerImageUrl && (
                                    <div className="h-48 bg-gray-100 overflow-hidden">
                                        <Image
                                            width={500}
                                            height={300}
                                            src={offer.offerImageUrl}
                                            alt={offer.title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-3">
                                        <h3 className="text-xl font-semibold text-gray-900 line-clamp-2">{offer.title}</h3>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleDeleteOffer(offer._id)}
                                                className="text-red-500 hover:text-red-700 p-1"
                                                type="button"
                                                aria-label={`Delete offer: ${offer.title}`}
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>

                                    <p className="text-gray-600 mb-4 line-clamp-3">{offer.description}</p>

                                    <div className="space-y-2 mb-4">
                                        <div className="flex items-center gap-2">
                                            <Percent className="w-4 h-4 text-green-600" />
                                            <span className="text-2xl font-bold text-green-600">{offer.discountPercentage}%</span>
                                            <span className="text-gray-500">OFF</span>
                                        </div>

                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <Calendar className="w-4 h-4" />
                                            <span>{formatDate(offer.validFrom)} - {formatDate(offer.validTo)}</span>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${offer.isActive
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {offer.isActive ? 'Active' : 'Inactive'}
                                        </span>

                                        <div className="text-xs text-gray-500">
                                            {isOfferExpired(offer.validTo) ? 'Expired' : 'Valid'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Create Offer Modal */}
                {showCreateModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b border-gray-200">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-2xl font-bold text-gray-900">Create New Offer</h2>
                                    <button
                                        onClick={() => {
                                            setShowCreateModal(false);
                                            resetForm();
                                        }}
                                        className="text-gray-400 hover:text-gray-600"
                                        type="button"
                                        aria-label="Close modal"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Image Upload */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Offer Image
                                    </label>
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 relative">
                                        {imagePreview ? (
                                            <div className="relative">
                                                <Image
                                                    width={500}
                                                    height={300}
                                                    src={imagePreview}
                                                    alt="Preview"
                                                    className="w-full h-48 object-cover rounded-lg"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedImage(null);
                                                        setImagePreview('');
                                                    }}
                                                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                                    aria-label="Remove image"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="text-center">
                                                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                                <p className="text-gray-600 mb-2">Click to upload image</p>
                                                <p className="text-xs text-gray-500">Max size: 4MB</p>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleImageSelect}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Title */}
                                <div>
                                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                                        Title *
                                    </label>
                                    <input
                                        id="title"
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Enter offer title"
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                                        Description *
                                    </label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        required
                                        rows={4}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Enter offer description"
                                    />
                                </div>

                                {/* Discount Percentage */}
                                <div>
                                    <label htmlFor="discountPercentage" className="block text-sm font-medium text-gray-700 mb-2">
                                        Discount Percentage *
                                    </label>
                                    <input
                                        id="discountPercentage"
                                        type="number"
                                        name="discountPercentage"
                                        value={formData.discountPercentage}
                                        onChange={handleInputChange}
                                        required
                                        min="1"
                                        max="100"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Enter discount percentage"
                                    />
                                </div>

                                {/* Valid From and To */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="validFrom" className="block text-sm font-medium text-gray-700 mb-2">
                                            Valid From
                                        </label>
                                        <input
                                            id="validFrom"
                                            type="date"
                                            name="validFrom"
                                            value={formData.validFrom}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="validTo" className="block text-sm font-medium text-gray-700 mb-2">
                                            Valid To
                                        </label>
                                        <input
                                            id="validTo"
                                            type="date"
                                            name="validTo"
                                            value={formData.validTo}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                {/* Is Active */}
                                <div className="flex items-center">
                                    <input
                                        id="isActive"
                                        type="checkbox"
                                        name="isActive"
                                        checked={formData.isActive}
                                        onChange={handleInputChange}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <label htmlFor="isActive" className="ml-2 text-sm font-medium text-gray-700">
                                        Make this offer active immediately
                                    </label>
                                </div>

                                {/* Submit Button */}
                                <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowCreateModal(false);
                                            resetForm();
                                        }}
                                        className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleCreateOffer}
                                        disabled={isSubmitting}
                                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                Creating...
                                            </>
                                        ) : (
                                            'Create Offer'
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OffersManagement;