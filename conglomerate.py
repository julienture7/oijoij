import tkinter as tk
from tkinter import filedialog, messagebox
import os
import base64

def is_text_file(file_path):
    """Check if a file is likely a text file by attempting to read it."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            f.read(1024)  # Read a small portion
        return True
    except (UnicodeDecodeError, IOError):
        return False

def read_file_content(file_path):
    """Read file content as text or base64 encode if binary."""
    if is_text_file(file_path):
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                return f.read()
        except Exception as e:
            return f"Error reading as text: {str(e)}"
    else:
        try:
            with open(file_path, 'rb') as f:
                return base64.b64encode(f.read()).decode('utf-8')
        except Exception as e:
            return f"Error reading as binary: {str(e)}"

def select_folder():
    """Open folder selection dialog and populate file list with files from the selected folder only."""
    folder = filedialog.askdirectory()
    if folder:
        folder_path.set(folder)
        file_list.delete(0, tk.END)
        selected_files.clear()
        # List only files in the selected folder (not subfolders)
        try:
            for entry in os.listdir(folder):
                full_path = os.path.join(folder, entry)
                if os.path.isfile(full_path):
                    file_list.insert(tk.END, full_path)
                    selected_files.append(full_path)
                    file_list.selection_set(tk.END)
            generate_button.config(state='normal' if selected_files else 'disabled')
        except Exception as e:
            messagebox.showerror("Error", f"Failed to list files: {str(e)}")

def add_files():
    """Allow adding specific files from anywhere and select them."""
    files = filedialog.askopenfilenames()
    if files:
        for file_path in files:
            if file_path not in [file_list.get(i) for i in range(file_list.size())]:
                file_list.insert(tk.END, file_path)
                selected_files.append(file_path)
                file_list.selection_set(tk.END)
        generate_button.config(state='normal' if selected_files else 'disabled')

def toggle_file_selection(event):
    """Toggle file selection in the listbox."""
    index = file_list.curselection()
    if index:
        file_path = file_list.get(index)
        if file_path in selected_files:
            selected_files.remove(file_path)
            file_list.selection_clear(index)
        else:
            selected_files.append(file_path)
            file_list.selection_set(index)
        generate_button.config(state='normal' if selected_files else 'disabled')

def generate_output():
    """Generate a text file with selected files' contents in the specified format."""
    if not selected_files:
        messagebox.showwarning("No Files", "Please select at least one file.")
        return

    output_file = filedialog.asksaveasfilename(defaultextension=".txt", filetypes=[("Text files", "*.txt")])
    if not output_file:
        return

    try:
        with open(output_file, 'w', encoding='utf-8') as f:
            for file_path in selected_files:
                content = read_file_content(file_path)
                file_name = os.path.basename(file_path)
                f.write(f"\"{file_name}\", \"{file_path}\": \"{content}\"\n\n")
        messagebox.showinfo("Success", f"Output saved to {output_file}")
    except Exception as e:
        messagebox.showerror("Error", f"Failed to generate output: {str(e)}")

# Set up the GUI
root = tk.Tk()
root.title("File Content Exporter")
root.geometry("600x400")

folder_path = tk.StringVar()
selected_files = []

# Folder and file selection
tk.Label(root, text="Selected Folder:").pack(pady=5)
tk.Entry(root, textvariable=folder_path, width=50, state='readonly').pack()
tk.Button(root, text="Select Folder", command=select_folder).pack(pady=5)
tk.Button(root, text="Add Specific Files", command=add_files).pack(pady=5)

# File list
tk.Label(root, text="Files (click to select/deselect):").pack()
file_list = tk.Listbox(root, selectmode='multiple', width=80, height=15)
file_list.pack(pady=5)
file_list.bind('<Button-1>', toggle_file_selection)

# Generate output button
generate_button = tk.Button(root, text="Export to Text File", command=generate_output, state='disabled')
generate_button.pack(pady=10)

# Start the application
root.mainloop()