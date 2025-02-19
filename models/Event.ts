import { ObjectId } from "mongodb"
import clientPromise from "@/lib/mongodb"
import type { Event } from "@/types/event"

export async function getEventCollection() {
  const client = await clientPromise
  const db = client.db("eventManager")
  return db.collection<Event>("events")
}

export async function getAllEvents(): Promise<Event[]> {
  const collection = await getEventCollection()
  return collection.find({}).toArray()
}

export async function getEventById(id: string): Promise<Event | null> {
  const collection = await getEventCollection()
  return collection.findOne({ _id: new ObjectId(id) })
}

export async function createEvent(event: Omit<Event, "id">): Promise<Event> {
  const collection = await getEventCollection()
  const result = await collection.insertOne(event as any)
  return { ...event, id: result.insertedId.toString() } as Event
}

export async function updateEvent(id: string, event: Partial<Event>): Promise<Event | null> {
  const collection = await getEventCollection()
  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: event },
    { returnDocument: "after" },
  )
  return result.value as Event | null
}

export async function deleteEvent(id: string): Promise<boolean> {
  const collection = await getEventCollection()
  const result = await collection.deleteOne({ _id: new ObjectId(id) })
  return result.deletedCount === 1
}

