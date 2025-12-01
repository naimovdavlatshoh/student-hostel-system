import React, { useState, useEffect } from "react";
import { RoomFormData, isRoomFormValid, createRoom } from "./data";
import { fetchFloors, Floor } from "../Rooms/data";
import CustomModal from "@/components/ui/custom-modal";
import { CustomInput, CustomCombobox } from "@/components/ui/custom-form";
import { Button } from "@/components/ui/button";
import { IoMdAdd } from "react-icons/io";

interface AddRoomModalProps {
    onCreated: () => void;
}

const AddRoomModal: React.FC<AddRoomModalProps> = ({ onCreated }) => {
    const [formData, setFormData] = useState<RoomFormData>({
        floor_id: "",
        room_number: "",
        room_type: "",
    });
    const [isOpen, setIsOpen] = useState(false);
    const [floors, setFloors] = useState<Floor[]>([]);

    useEffect(() => {
        const loadFloors = async () => {
            const floorsData = await fetchFloors();
            setFloors(floorsData);
        };
        loadFloors();
    }, []);

    const handleFloorChange = (value: string) => {
        setFormData({ ...formData, floor_id: value });
    };

    const handleRoomNumberChange = (value: string) => {
        const numericValue = value.replace(/\D/g, "");
        setFormData({ ...formData, room_number: numericValue });
    };

    const handleRoomTypeChange = (value: string) => {
        setFormData({ ...formData, room_type: value });
    };

    const floorOptions = floors.map((floor) => ({
        value: floor.floor_id.toString(),
        label: `Этаж ${floor.floor_number}`,
    }));

    const roomTypeOptions = [
        { value: "1", label: "Восьмиместный" },
        { value: "2", label: "Четырехместный" },
        { value: "3", label: "Двухместный" },
        { value: "4", label: "Одноместный" },
    ];

    const handleConfirm = async () => {
        if (!isRoomFormValid(formData)) return;
        await createRoom(formData);
        setFormData({ floor_id: "", room_number: "", room_type: "" });
        onCreated();
        setIsOpen(false);
    };

    return (
        <CustomModal
            title="Добавить комнату"
            showTrigger={true}
            open={isOpen}
            onOpenChange={setIsOpen}
            trigger={
                <Button className="bg-black text-white hover:bg-black/80 rounded-xl">
                    <IoMdAdd className="w-3 h-3" /> Добавить комнату
                </Button>
            }
            confirmText="Сохранить"
            cancelText="Отмена"
            confirmBg="bg-black"
            confirmBgHover="bg-black/80"
            confirmDisabled={!isRoomFormValid(formData)}
            onConfirm={handleConfirm}
            size="sm"
        >
            <div className="space-y-4 mt-2">
                <CustomCombobox
                    label="Этаж"
                    placeholder="Выберите этаж"
                    value={formData.floor_id}
                    onChange={handleFloorChange}
                    options={floorOptions}
                    required
                />
                <CustomInput
                    label="Номер комнаты"
                    placeholder="Например: 101"
                    value={formData.room_number}
                    onChange={handleRoomNumberChange}
                    type="text"
                    required
                />
                <CustomCombobox
                    label="Тип комнаты"
                    placeholder="Выберите тип"
                    value={formData.room_type}
                    onChange={handleRoomTypeChange}
                    options={roomTypeOptions}
                    required
                />
            </div>
        </CustomModal>
    );
};

export default AddRoomModal;
