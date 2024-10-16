"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon, Trash2Icon, PencilIcon, PlusIcon } from "lucide-react"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

type Task = {
  id: number
  title: string
  startDate: string
  endDate?: string
  description: string[]
  status: "Ongoing" | "Send for review" | "Final stage" | "Complete"
}

const getStatusColor = (status: Task["status"]) => {
  switch (status) {
    case "Ongoing": return "bg-blue-100 border-blue-500 text-blue-700"
    case "Send for review": return "bg-yellow-100 border-yellow-500 text-yellow-700"
    case "Final stage": return "bg-purple-100 border-purple-500 text-purple-700"
    case "Complete": return "bg-green-100 border-green-500 text-green-700"
    default: return "bg-gray-100 border-gray-500 text-gray-700"
  }
}

export default function DailyTodoList() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTask, setNewTask] = useState<Omit<Task, "id">>({
    title: "",
    startDate: new Date().toISOString(),
    description: [""],
    status: "Ongoing",
  })
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    const storedTasks = localStorage.getItem('tasks')
    if (storedTasks) {
      setTasks(JSON.parse(storedTasks))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks))
  }, [tasks])

  const handleAddTask = () => {
    if (newTask.title.trim() === "") return
    if (editingTaskId !== null) {
      setTasks(tasks.map(task => task.id === editingTaskId ? { ...newTask, id: task.id } : task))
      setEditingTaskId(null)
    } else {
      setTasks([{ ...newTask, id: Date.now() }, ...tasks])
    }
    setNewTask({ title: "", startDate: new Date().toISOString(), description: [""], status: "Ongoing" })
    setIsDialogOpen(false)
  }

  const handleDeleteTask = (id: number) => {
    setTasks(tasks.filter(task => task.id !== id))
  }

  const handleEditTask = (task: Task) => {
    setNewTask(task)
    setEditingTaskId(task.id)
    setIsDialogOpen(true)
  }

  const handleAddSubTask = () => {
    setNewTask({ ...newTask, description: [...newTask.description, ""] })
  }

  const handleUpdateSubTask = (index: number, value: string) => {
    const updatedDescription = [...newTask.description]
    updatedDescription[index] = value
    setNewTask({ ...newTask, description: updatedDescription })
  }

  const groupedTasks = tasks.reduce((acc, task) => {
    if (!acc[task.status]) {
      acc[task.status] = []
    }
    acc[task.status].push(task)
    return acc
  }, {} as Record<Task["status"], Task[]>)

  const statusOrder: Task["status"][] = ["Ongoing", "Send for review", "Final stage", "Complete"]

  return (
    <div className="container mx-auto p-4 max-w-7xl min-h-screen flex flex-col" style={{ fontFamily: 'Poppins, sans-serif' }}>
      <header className="mb-8">
        <h1 className="items-center text-3xl font-bold text-gray-800 mb-2">Daily To-Do List Manager</h1>
        <p className="text-gray-600">Organize your tasks efficiently</p>
      </header>
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-500 hover:bg-blue-600 text-white">
              <PlusIcon className="mr-2 h-4 w-4" /> Add Task
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingTaskId !== null ? "Edit Task" : "Add New Task"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); handleAddTask(); }} className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="Enter task title"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal mt-1">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newTask.startDate ? format(new Date(newTask.startDate), "PPP") : <span>Pick a start date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={new Date(newTask.startDate)}
                      onSelect={(date) => setNewTask({ ...newTask, startDate: date?.toISOString() || new Date().toISOString() })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label>End Date (Optional)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal mt-1">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newTask.endDate ? format(new Date(newTask.endDate), "PPP") : <span>Pick an end date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={newTask.endDate ? new Date(newTask.endDate) : undefined}
                      onSelect={(date) => setNewTask({ ...newTask, endDate: date?.toISOString() })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label>Description (Sub-tasks)</Label>
                {newTask.description.map((subTask, index) => (
                  <Input
                    key={index}
                    value={subTask}
                    onChange={(e) => handleUpdateSubTask(index, e.target.value)}
                    placeholder={`Sub-task ${index + 1}`}
                    className="mt-2"
                  />
                ))}
                <Button type="button" onClick={handleAddSubTask} className="mt-2" variant="outline">
                  Add Sub-task
                </Button>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={newTask.status}
                  onValueChange={(value) => setNewTask({ ...newTask, status: value as Task["status"] })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ongoing">Ongoing</SelectItem>
                    <SelectItem value="Send for review">Send for review</SelectItem>
                    <SelectItem value="Final stage">Final stage</SelectItem>
                    <SelectItem value="Complete">Complete</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">{editingTaskId !== null ? "Update Task" : "Add Task"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statusOrder.map((status) => (
          <div key={status} className="space-y-4">
            <h2 className="text-xl font-semibold">{status}</h2>
            {groupedTasks[status]?.map((task) => (
              <Card key={task.id} className={`${getStatusColor(task.status)} border-l-4 shadow-md transition-all hover:shadow-lg`}>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span className="truncate text-lg">{task.title}</span>
                    <div>
                      <Button variant="ghost" size="icon" onClick={() => handleEditTask(task)}>
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteTask(task.id)}>
                        <Trash2Icon className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-2">
                    <span className="font-semibold">Start:</span> {format(new Date(task.startDate), "PPP")}
                    {task.endDate && <><br /><span className="font-semibold">End:</span> {format(new Date(task.endDate), "PPP")}</>}
                  </p>
                  <ul className="list-disc list-inside mb-2 text-sm">
                    {task.description.map((subTask, index) => (
                      <li key={index} className="truncate">{subTask}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        ))}
      </div>
      <footer className="mt-auto text-center text-gray-500 text-sm py-4">
        &copy; {new Date().getFullYear()} devSalman. All rights reserved.
      </footer>
    </div>
  )
}