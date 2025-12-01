import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FloorFormData, isFloorFormValid, createFloor } from "./data";
import CustomModal from "@/components/ui/custom-modal";
import { Button } from "@/components/ui/button";
import { IoMdAdd } from "react-icons/io";

interface AddFloorModalProps {
    onCreated: () => void;
}

const AddFloorModal: React.FC<AddFloorModalProps> = ({ onCreated }) => {
    const [formData, setFormData] = useState<FloorFormData>({
        floor_number: "",
    });
    const [isOpen, setIsOpen] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, "");
        setFormData({ floor_number: value });
    };

    const handleConfirm = async () => {
        if (!isFloorFormValid(formData)) return;
        await createFloor(formData);
        setFormData({ floor_number: "" });
        onCreated();
        setIsOpen(false); // Close modal after successful creation
    };

    return (
        <CustomModal
            title="Добавить этаж"
            showTrigger={true}
            open={isOpen}
            onOpenChange={setIsOpen}
            trigger={
                <Button className="bg-black text-white hover:bg-black/80 rounded-xl">
                    <IoMdAdd className="w-3 h-3" /> Добавить этаж
                </Button>
            }
            confirmText="Сохранить"
            cancelText="Отмена"
            confirmBg="bg-black"
            confirmBgHover="bg-black/80"
            confirmDisabled={!isFloorFormValid(formData)}
            onConfirm={handleConfirm}
            size="sm"
        >
            <div className="space-y-4 mt-2">
                <div className="space-y-2">
                    <Label htmlFor="floor_number">Номер этажа</Label>
                    <Input
                        id="floor_number"
                        value={formData.floor_number}
                        onChange={handleChange}
                        placeholder="Например: 1"
                        maxLength={2}
                    />
                </div>
            </div>
        </CustomModal>
    );
};

export default AddFloorModal;
