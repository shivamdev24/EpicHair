
"use client";

import { useEffect, useState } from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import Modal from '@/components/dashboard/NewService'; // Import the Modal component
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"



interface Service {
    _id: string;
    name: string;
    description?: string;
    price?: number;
    duration: number;
    service_url?: string;
}

const ServiceManagement = () => {
    const [services, setServices] = useState<Service[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [servicesPerPage] = useState<number>(10);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    const [newService, setNewService] = useState<{
        name: string;
        description?: string;
        price: number;
        duration: number;
    }>({
        name: '',
        description: '',
        price: 0,
        duration: 0,
    });




  




    const fetchServices = async () => {
        try {
            const response = await fetch('/api/admin/service');
            const data = await response.json();
            if (Array.isArray(data)) {
                setServices(data);
            } else {
                console.warn('Expected services to be an array but got: undefined');
            }
        } catch (error) {
            console.error('Error fetching services:', error);
        }
    };
    useEffect(() => {

        fetchServices();
    }, []);

    const handleDeleteService = async (serviceId: string) => {
        try {
            const response = await fetch(`/api/admin/service?id=${serviceId}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                setServices(services.filter(service => service._id !== serviceId));
            } else {
                console.error('Failed to delete service:', response.statusText);
                alert('Failed to delete service.');
            }
        } catch (error) {
            console.error('Error deleting service:', error);
            alert('Error deleting service.');
        }
    };

    const indexOfLastService = currentPage * servicesPerPage;
    const indexOfFirstService = indexOfLastService - servicesPerPage;
    const currentServices = services.slice(indexOfFirstService, indexOfLastService);
    const totalPages = Math.ceil(services.length / servicesPerPage);

    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    return (
      <div className="px-5">
        <section className="py-10 flex gap-4 flex-col-reverse md:flex-row justify-between">
          <Card className="w-72">
            <CardHeader>
              <CardTitle>Total Services</CardTitle>
            </CardHeader>
            <CardContent className="text-xl font-bold text-blue-500">
              {services.length}
            </CardContent>
          </Card>
          <div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Create New Service
            </button>
            <Modal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              newService={newService}
              setNewService={setNewService}
              onServiceCreated={fetchServices}
              onSubmit={function (): void {
                throw new Error("Function not implemented.");
              }}
            />
          </div>
        </section>

        <Card className="overflow-hidden overflow-x-auto">
          <table className="min-w-full border-collapse border border-gray-300">
            <thead>
              <tr>
                <th className="border border-gray-300 px-4 py-2">
                  Service Image
                </th>
                <th className="border border-gray-300 px-4 py-2">
                  Service Name
                </th>
                <th className="border border-gray-300 px-4 py-2">
                  Description
                </th>
                <th className="border border-gray-300 px-4 py-2">Price</th>
                <th className="border border-gray-300 px-4 py-2">Duration</th>
                <th className="border border-gray-300 px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentServices.map((service) => (
                <tr key={service._id} className="hover:bg-gray-100">
                  <td className="border-b border-t border-gray-300 px-4 py-2 flex justify-center">
                    <Avatar>
                      <AvatarImage
                        src={service.service_url}
                        alt={service.name}
                      />
                      <AvatarFallback>A</AvatarFallback>
                    </Avatar>
                  </td>
                  <td className="border text-center border-gray-300 px-4 py-2">
                    {service.name}
                  </td>
                  <td className="border text-center border-gray-300 px-4 py-2">
                    {service.description}
                  </td>
                  <td className="border text-center border-gray-300 px-4 py-2">
                    {service.price}
                  </td>
                  <td className="border text-center border-gray-300 px-4 py-2">
                    {service.duration}
                  </td>
                  <td className="border text-center border-gray-300 px-4 py-2">
                    <button
                      onClick={() => handleDeleteService(service._id)}
                      className="text-red-500 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <div className="flex justify-center mt-4">
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index}
              onClick={() => handlePageChange(index + 1)}
              className={`px-3 py-1 border border-gray-300 ${
                currentPage === index + 1
                  ? "bg-blue-500 text-white"
                  : "text-blue-500"
              } hover:bg-blue-600 hover:text-white`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>
    );
};

export default ServiceManagement;


