
import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Room } from "@/types";

interface RoomSelectorProps {
  rooms: Room[];
  selectedRoom: string;
  onRoomChange: (roomId: string) => void;
  isLoadingRooms: boolean;
}

const RoomSelector: React.FC<RoomSelectorProps> = ({ 
  rooms, 
  selectedRoom, 
  onRoomChange, 
  isLoadingRooms 
}) => {
  return (
    <div>
      <Label htmlFor="roomSelect">Select Room</Label>
      <Select
        value={selectedRoom}
        onValueChange={onRoomChange}
        disabled={isLoadingRooms || rooms.length === 0}
      >
        <SelectTrigger id="roomSelect" className="w-full mt-1">
          <SelectValue placeholder="Select a room" />
        </SelectTrigger>
        <SelectContent>
          {rooms.map((room) => (
            <SelectItem key={room.id} value={room.id}>
              Room {room.roomNumber || room.room_number} - {room.totalBeds || room.capacity} beds
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {isLoadingRooms && <p className="text-sm text-muted-foreground mt-1">Loading rooms...</p>}
      {!isLoadingRooms && rooms.length === 0 && (
        <p className="text-sm text-muted-foreground mt-1">No rooms available</p>
      )}
    </div>
  );
};

export default RoomSelector;
