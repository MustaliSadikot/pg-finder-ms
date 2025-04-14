
import React, { useState, useEffect } from "react";
import { Room, Bed as BedType } from "@/types";
import { roomAPI, bedAPI } from "@/services/roomApi";
import { bookingsAPI } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Bed as BedIcon, Info } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface RoomManagementProps {
  pgId: string;
}

const RoomManagement: React.FC<RoomManagementProps> = ({ pgId }) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [beds, setBeds] = useState<Record<string, BedType[]>>({});
  const [loading, setLoading] = useState(true);
  const [newRoom, setNewRoom] = useState<Partial<Room>>({
    roomNumber: "",
    totalBeds: 1,
    capacityPerBed: 1,
    availability: true,
  });
  const [newBed, setNewBed] = useState<Partial<BedType & { roomId: string }>>({
    bedNumber: 1,
    isOccupied: false,
    roomId: "",
  });
  const [isAddingRoom, setIsAddingRoom] = useState(false);
  const [isAddingBed, setIsAddingBed] = useState(false);
  const [bedsWithBookings, setBedsWithBookings] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  useEffect(() => {
    loadRooms();
  }, [pgId]);

  const loadRooms = async () => {
    setLoading(true);
    try {
      const roomsData = await roomAPI.getRoomsByPGId(pgId);
      setRooms(roomsData);

      const bedsData: Record<string, BedType[]> = {};
      for (const room of roomsData) {
        const roomBeds = await bedAPI.getBedsByRoomId(room.id);
        bedsData[room.id] = roomBeds;
      }
      setBeds(bedsData);

      const bookings = await bookingsAPI.getPGBookings(pgId);
      const confirmedBookings = bookings.filter(booking => booking.status === 'confirmed');
      
      const bedBookings: Record<string, boolean> = {};
      confirmedBookings.forEach(booking => {
        if (booking.bedId) {
          bedBookings[booking.bedId] = true;
        }
      });
      
      setBedsWithBookings(bedBookings);
    } catch (error) {
      console.error("Error loading rooms:", error);
      toast({
        title: "Error",
        description: "Failed to load rooms",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddRoom = async () => {
    try {
      if (!newRoom.roomNumber) {
        toast({
          title: "Validation Error",
          description: "Room number is required",
          variant: "destructive",
        });
        return;
      }

      const room: Omit<Room, "id"> = {
        pgId,
        roomNumber: newRoom.roomNumber || "",
        totalBeds: Number(newRoom.totalBeds) || 1,
        capacityPerBed: Number(newRoom.capacityPerBed) || 1,
        availability: newRoom.availability ?? true,
      };

      const addedRoom = await roomAPI.addRoom(room);
      setRooms([...rooms, addedRoom]);
      
      // Automatically create beds based on totalBeds
      const totalBedsToCreate = Number(newRoom.totalBeds) || 1;
      const bedsCreationPromises = [];
      
      for (let i = 1; i <= totalBedsToCreate; i++) {
        const bed: Omit<BedType, "id"> = {
          roomId: addedRoom.id,
          bedNumber: i,
          isOccupied: false,
        };
        bedsCreationPromises.push(bedAPI.addBed(bed));
      }
      
      const createdBeds = await Promise.all(bedsCreationPromises);
      const updatedBeds = { ...beds };
      updatedBeds[addedRoom.id] = createdBeds;
      setBeds(updatedBeds);
      
      setNewRoom({
        roomNumber: "",
        totalBeds: 1,
        capacityPerBed: 1,
        availability: true,
      });
      setIsAddingRoom(false);
      
      toast({
        title: "Success",
        description: `Room added successfully with ${totalBedsToCreate} beds`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add room",
        variant: "destructive",
      });
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    try {
      await roomAPI.deleteRoom(roomId);
      setRooms(rooms.filter(room => room.id !== roomId));
      const newBeds = { ...beds };
      delete newBeds[roomId];
      setBeds(newBeds);
      
      toast({
        title: "Success",
        description: "Room deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete room",
        variant: "destructive",
      });
    }
  };

  const handleAddBed = async () => {
    try {
      if (!newBed.roomId) {
        toast({
          title: "Validation Error",
          description: "Please select a room",
          variant: "destructive",
        });
        return;
      }

      const bed: Omit<BedType, "id"> = {
        roomId: newBed.roomId,
        bedNumber: Number(newBed.bedNumber) || 1,
        isOccupied: newBed.isOccupied || false,
      };

      const addedBed = await bedAPI.addBed(bed);
      const updatedBeds = { ...beds };
      updatedBeds[bed.roomId] = [...(updatedBeds[bed.roomId] || []), addedBed];
      setBeds(updatedBeds);
      setNewBed({
        bedNumber: 1,
        isOccupied: false,
        roomId: "",
      });
      setIsAddingBed(false);
      
      toast({
        title: "Success",
        description: "Bed added successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add bed",
        variant: "destructive",
      });
    }
  };

  const handleDeleteBed = async (bedId: string, roomId: string) => {
    try {
      await bedAPI.deleteBed(bedId);
      const updatedBeds = { ...beds };
      updatedBeds[roomId] = updatedBeds[roomId].filter(bed => bed.id !== bedId);
      setBeds(updatedBeds);
      
      toast({
        title: "Success",
        description: "Bed deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete bed",
        variant: "destructive",
      });
    }
  };

  const toggleBedOccupancy = async (bed: BedType) => {
    if (bedsWithBookings[bed.id] && !bed.isOccupied) {
      toast({
        title: "Cannot change status",
        description: "This bed has an active booking and cannot be changed manually.",
        variant: "destructive",
      });
      return;
    }

    try {
      const updatedBed = { ...bed, isOccupied: !bed.isOccupied };
      await bedAPI.updateBed(updatedBed);
      
      const updatedBeds = { ...beds };
      updatedBeds[bed.roomId] = updatedBeds[bed.roomId].map(b => 
        b.id === bed.id ? updatedBed : b
      );
      setBeds(updatedBeds);
      
      toast({
        title: "Success",
        description: `Bed marked as ${updatedBed.isOccupied ? 'occupied' : 'vacant'}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update bed status",
        variant: "destructive",
      });
    }
  };

  const toggleRoomAvailability = async (room: Room) => {
    try {
      const updatedRoom = { ...room, availability: !room.availability };
      await roomAPI.updateRoom(updatedRoom);
      
      setRooms(rooms.map(r => r.id === room.id ? updatedRoom : r));
      
      toast({
        title: "Success",
        description: `Room marked as ${updatedRoom.availability ? 'available' : 'unavailable'}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update room status",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="text-center my-8">Loading rooms...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Rooms & Beds Management</h2>
        <div className="space-x-2">
          <Dialog open={isAddingRoom} onOpenChange={setIsAddingRoom}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Room
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Room</DialogTitle>
                <DialogDescription>
                  Fill out the details to add a new room to your PG.
                  Beds will be automatically created based on the total beds count.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="roomNumber">Room Number/Name</Label>
                  <Input
                    id="roomNumber"
                    value={newRoom.roomNumber || ""}
                    onChange={(e) => setNewRoom({ ...newRoom, roomNumber: e.target.value })}
                    placeholder="e.g. 101 or Master Room"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="totalBeds">Total Beds</Label>
                  <Input
                    id="totalBeds"
                    type="number"
                    min="1"
                    value={newRoom.totalBeds || 1}
                    onChange={(e) => setNewRoom({ ...newRoom, totalBeds: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capacityPerBed">Capacity Per Bed</Label>
                  <Input
                    id="capacityPerBed"
                    type="number"
                    min="1"
                    value={newRoom.capacityPerBed || 1}
                    onChange={(e) => setNewRoom({ ...newRoom, capacityPerBed: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddingRoom(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddRoom}>Add Room with Beds</Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isAddingBed} onOpenChange={setIsAddingBed}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <BedIcon className="h-4 w-4 mr-2" />
                Add Bed
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Bed</DialogTitle>
                <DialogDescription>
                  Add a new bed to one of your rooms.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="roomSelect">Select Room</Label>
                  <select
                    id="roomSelect"
                    className="w-full p-2 border rounded"
                    value={newBed.roomId || ""}
                    onChange={(e) => setNewBed({ ...newBed, roomId: e.target.value })}
                  >
                    <option value="">Select a room</option>
                    {rooms.map((room) => (
                      <option key={room.id} value={room.id}>
                        {room.roomNumber}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bedNumber">Bed Number</Label>
                  <Input
                    id="bedNumber"
                    type="number"
                    min="1"
                    value={newBed.bedNumber || 1}
                    onChange={(e) => setNewBed({ ...newBed, bedNumber: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddingBed(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddBed}>Add Bed</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {rooms.length === 0 ? (
        <div className="text-center p-8 border rounded-md bg-gray-50">
          <p className="text-muted-foreground">No rooms added yet. Start by adding a room.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {rooms.map((room) => (
            <Card key={room.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl">Room {room.roomNumber}</CardTitle>
                  <div className="flex space-x-2">
                    <Badge
                      className={`cursor-pointer ${
                        room.availability
                          ? "bg-green-100 text-green-800 hover:bg-green-200"
                          : "bg-red-100 text-red-800 hover:bg-red-200"
                      }`}
                      onClick={() => toggleRoomAvailability(room)}
                    >
                      {room.availability ? "Available" : "Unavailable"}
                    </Badge>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleDeleteRoom(room.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">Capacity:</span> {room.totalBeds} beds, {room.capacityPerBed} {room.capacityPerBed > 1 ? "persons" : "person"} per bed
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Beds</h4>
                  </div>
                  
                  {beds[room.id]?.length ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {beds[room.id].map((bed) => (
                        <div
                          key={bed.id}
                          className={`p-3 rounded-md flex justify-between items-center border ${
                            bed.isOccupied ? "bg-red-50" : "bg-green-50"
                          }`}
                        >
                          <div>
                            <p className="font-medium">Bed #{bed.bedNumber}</p>
                            <Badge
                              variant="outline"
                              className={`mt-1 cursor-pointer ${
                                bed.isOccupied
                                  ? "bg-red-100 text-red-800 hover:bg-red-200"
                                  : "bg-green-100 text-green-800 hover:bg-green-200"
                              } ${bedsWithBookings[bed.id] ? "opacity-50" : ""}`}
                              onClick={() => toggleBedOccupancy(bed)}
                            >
                              {bed.isOccupied ? "Occupied" : "Vacant"}
                              {bedsWithBookings[bed.id] && (
                                <Info className="ml-1 h-3 w-3" aria-label="This bed has an active booking" />
                              )}
                            </Badge>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-500"
                            onClick={() => handleDeleteBed(bed.id, room.id)}
                            disabled={bedsWithBookings[bed.id]}
                            aria-label={bedsWithBookings[bed.id] ? "Cannot delete bed with active booking" : "Delete bed"}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No beds added yet.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default RoomManagement;
