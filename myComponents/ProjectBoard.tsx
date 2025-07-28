"use client";
import React, { useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";
import { v4 as uuidv4 } from "uuid";

interface Task {
  id: string;
  content: string;
  deadline?: string;
}

interface Column {
  id: string;
  title: string;
  taskIds: string[];
}

interface BoardData {
  tasks: { [key: string]: Task };
  columns: { [key: string]: Column };
  columnOrder: string[];
}

const initialData: BoardData = {
  tasks: {
    "task-1": {
      id: "task-1",
      content: "Write script outline",
      deadline: "2025-02-20",
    },
    "task-2": {
      id: "task-2",
      content: "Cast audition schedule",
      deadline: "2025-02-25",
    },
    "task-3": {
      id: "task-3",
      content: "Scout locations",
      deadline: "2025-03-01",
    },
  },
  columns: {
    "column-1": {
      id: "column-1",
      title: "To Do",
      taskIds: ["task-1", "task-2", "task-3"],
    },
    "column-2": {
      id: "column-2",
      title: "In Progress",
      taskIds: [],
    },
    "column-3": {
      id: "column-3",
      title: "Done",
      taskIds: [],
    },
  },
  columnOrder: ["column-1", "column-2", "column-3"],
};

export const ProjectBoard: React.FC = () => {
  const [boardData, setBoardData] = useState<BoardData>(initialData);
  const [newTaskContent, setNewTaskContent] = useState("");
  const [newTaskDeadline, setNewTaskDeadline] = useState("");

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    console.log("Drag ended:", result);

    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return;

    setBoardData((prevData) => {
      const start = prevData.columns[source.droppableId];
      const finish = prevData.columns[destination.droppableId];

      // Moving within the same column
      if (start === finish) {
        const newTaskIds = Array.from(start.taskIds);
        newTaskIds.splice(source.index, 1);
        newTaskIds.splice(destination.index, 0, draggableId);
        const newColumn = { ...start, taskIds: newTaskIds };

        return {
          ...prevData,
          columns: { ...prevData.columns, [newColumn.id]: newColumn },
        };
      }

      // Moving between columns
      const startTaskIds = Array.from(start.taskIds);
      startTaskIds.splice(source.index, 1);
      const newStart = { ...start, taskIds: startTaskIds };

      const finishTaskIds = Array.from(finish.taskIds);
      finishTaskIds.splice(destination.index, 0, draggableId);
      const newFinish = { ...finish, taskIds: finishTaskIds };

      return {
        ...prevData,
        columns: {
          ...prevData.columns,
          [newStart.id]: newStart,
          [newFinish.id]: newFinish,
        },
      };
    });
  };

  const addTask = () => {
    if (!newTaskContent) return;
    const newTaskId = uuidv4();
    const newTask: Task = {
      id: newTaskId,
      content: newTaskContent,
      deadline: newTaskDeadline || undefined,
    };
    const updatedTasks = {
      ...boardData.tasks,
      [newTaskId]: newTask,
    };
    const firstColumnId = boardData.columnOrder[0];
    const updatedFirstColumn = {
      ...boardData.columns[firstColumnId],
      taskIds: [...boardData.columns[firstColumnId].taskIds, newTaskId],
    };
    setBoardData({
      ...boardData,
      tasks: updatedTasks,
      columns: {
        ...boardData.columns,
        [firstColumnId]: updatedFirstColumn,
      },
    });
    setNewTaskContent("");
    setNewTaskDeadline("");
  };

  const deleteTask = (taskId: string, columnId: string) => {
    const updatedTasks = { ...boardData.tasks };
    delete updatedTasks[taskId];

    const updatedColumn = {
      ...boardData.columns[columnId],
      taskIds: boardData.columns[columnId].taskIds.filter(
        (id) => id !== taskId
      ),
    };

    setBoardData({
      ...boardData,
      tasks: updatedTasks,
      columns: {
        ...boardData.columns,
        [columnId]: updatedColumn,
      },
    });
  };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <input
          type="text"
          placeholder="Task content"
          value={newTaskContent}
          onChange={(e) => setNewTaskContent(e.target.value)}
          style={{ marginRight: 8 }}
        />
        <input
          type="date"
          value={newTaskDeadline}
          onChange={(e) => setNewTaskDeadline(e.target.value)}
          style={{ marginRight: 8 }}
        />
        <button onClick={addTask}>Add Task</button>
      </div>
      <DragDropContext onDragEnd={onDragEnd}>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            height: "100%",
          }}
        >
          {boardData.columnOrder.map((columnId) => {
            const column = boardData.columns[columnId];
            const tasks = column.taskIds.map(
              (taskId) => boardData.tasks[taskId]
            );
            return (
              <Column
                key={column.id}
                column={column}
                tasks={tasks}
                deleteTask={deleteTask}
              />
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
};

interface ColumnProps {
  column: Column;
  tasks: Task[];
  deleteTask: (taskId: string, columnId: string) => void;
}

const Column: React.FC<ColumnProps> = ({ column, tasks, deleteTask }) => (
  <div
    style={{
      margin: 8,
      border: "1px solid lightgrey",
      borderRadius: 2,
      width: 300,
      display: "flex",
      flexDirection: "column",
      background: "#f7f7f7",
    }}
  >
    <h3 style={{ padding: 8 }}>{column.title}</h3>
    <Droppable
      droppableId={column.id}
      isDropDisabled={false}
      isCombineEnabled={false} // Explicitly set isCombineEnabled to false
    >
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          style={{
            padding: 8,
            flexGrow: 1,
            minHeight: 150, // increased minHeight for empty columns
          }}
        >
          {tasks.map((task, index) => (
            <Draggable key={task.id} draggableId={task.id} index={index}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                  style={{
                    userSelect: "none",
                    padding: 16,
                    marginBottom: 8,
                    backgroundColor: "white",
                    borderRadius: 4,
                    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    ...provided.draggableProps.style,
                  }}
                >
                  <div>
                    <p style={{ margin: 0 }}>{task.content}</p>
                    {task.deadline && (
                      <small style={{ color: "gray" }}>
                        Deadline: {task.deadline}
                      </small>
                    )}
                  </div>
                  <button
                    onClick={() => deleteTask(task.id, column.id)}
                    style={{
                      background: "red",
                      color: "white",
                      border: "none",
                      padding: "4px 8px",
                      borderRadius: 4,
                      cursor: "pointer",
                    }}
                  >
                    ✕
                  </button>
                </div>
              )}
            </Draggable>
          ))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  </div>
);

export default ProjectBoard;
