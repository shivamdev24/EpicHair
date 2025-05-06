

"use client";

import { useState } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Image, X } from "lucide-react";

const Img = Image;

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    newService: {
        name: string;
        description?: string;
        price: number;
        duration: number;
    };
    setNewService: React.Dispatch<
        React.SetStateAction<{
            name: string;
            description?: string;
            price: number;
            duration: number;
        }>
    >;
    onServiceCreated: () => void;
}

const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    newService,
    setNewService,
    onServiceCreated,
}) => {
    const [fieldError, setFieldError] = useState<string | null>(null);
    const [image, setImage] = useState<File | null>(null);

    if (!isOpen) return null;

    const handleCreateService = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!newService.name || !newService.duration || !newService.price) {
            setFieldError("Name, price, and duration are required");
            return;
        }

        try {
            const formData = new FormData();
            formData.append("name", newService.name);
            formData.append("description", newService.description || "");
            formData.append("price", newService.price.toString());
            formData.append("duration", newService.duration.toString());
            if (image) {
                formData.append("image", image); // Attach the image file
            }

            const response = await fetch("/api/admin/service", {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                const createdService = await response.json();
                console.log("Created service:", createdService);
                setNewService({ name: "", description: "", price: 0, duration: 0 });
                setImage(null); // Reset image state
                onServiceCreated(); // Call onServiceCreated here
                setFieldError(null);
                onClose();
            } else {
                console.error("Failed to create service:", response.statusText);
                setFieldError("Failed to create service");
            }
        } catch (error) {
            console.error("Error creating service:", error);
        }
    };

    return (
        <div className="fixed w-screen inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="p-5 rounded-lg">
                <Card className="w-full p-5 shadow-lg md:w-[50rem] lg:h-[70vh] relative bg-white rounded-lg">
                    <button
                        onClick={onClose}
                        className="mt-2 absolute top-1 right-5 px-3 py-1 text-red-500 bg-white hover:text-white duration-50 rounded-md hover:bg-red-600"
                    >
                        <X />
                    </button>
                    <CardHeader>
                        <CardTitle>Services</CardTitle>
                        <CardDescription>Create New Services</CardDescription>
                    </CardHeader>
                    {fieldError && (
                        <span className="text-red-500 mb-2 block">{fieldError}</span>
                    )}

                    <CardContent>
                        <form onSubmit={handleCreateService} className="mb-4 grid grid-cols-1">
                            <div className="text-lg mb-3">
                                <label>
                                    Service Name: <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="Service Name"
                                    value={newService.name}
                                    onChange={(e) =>
                                        setNewService({ ...newService, name: e.target.value })
                                    }
                                    required
                                    className="border rounded border-gray-300 px-2 py-1 mr-2 w-full"
                                />
                            </div>

                            <div className="text-lg mb-3">
                                <label>Description:</label>
                                <input
                                    type="text"
                                    placeholder="Service Description"
                                    value={newService.description}
                                    onChange={(e) =>
                                        setNewService({
                                            ...newService,
                                            description: e.target.value,
                                        })
                                    }
                                    className="border rounded border-gray-300 px-2 py-1 mr-2 w-full"
                                />
                            </div>

                            <div className="flex flex-col lg:flex-row gap-2">
                                <div className="text-lg mb-3">
                                    <label>
                                        Price: <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="Price"
                                        value={newService.price}
                                        onChange={(e) =>
                                            setNewService({
                                                ...newService,
                                                price: parseFloat(e.target.value),
                                            })
                                        }
                                        required
                                        className="border rounded border-gray-300 px-2 py-1 mr-2 w-full"
                                    />
                                </div>

                                <div className="text-lg mb-3">
                                    <label>
                                        Duration (in minutes):{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="Duration"
                                        value={newService.duration}
                                        onChange={(e) =>
                                            setNewService({
                                                ...newService,
                                                duration: parseInt(e.target.value),
                                            })
                                        }
                                        required
                                        className="border rounded border-gray-300 px-2 py-1 mr-2 w-full"
                                    />
                                </div>
                            </div>

                            <div className="text-lg mb-3 flex gap-2 items-end">
                                <div className='flex gap-2 items-center'>
                                    <span>Upload Image :</span>
                                    <label
                                        htmlFor="file-upload"
                                        className="cursor-pointer flex items-center justify-center w-20 h-10 rounded  bg-gray-950 hover:bg-gray-600 duration-500"
                                    >
                                        <Img className="w-6 h-6 rounded text-white"/>
                                    </label>
                                </div>
                                    <span className="text-xs text-red-400">Format : png / jpg</span>
                                

                                <input
                                    id="file-upload"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) =>
                                        setImage(e.target.files ? e.target.files[0] : null)
                                    }
                                    className="hidden"
                                />
                            </div>

                            <div className="text-lg">
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                                >
                                    Add Service
                                </button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Modal;
