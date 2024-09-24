# Dreamify

## What is Dreamify?
A website for sharing dreams, tracking your dreaming consistency, and sharing them with others, featuring a modern design suitable for people of all ages.

## Technologies Used:
1. **.NET 8**
2. **SignalR** (for real-time communication)
3. **Entity Framework** (for database management)
4. **Bootstrap**
5. **HTML + CSS**

## What Does Dreamify Offer?
1. **Login Page**
2. **Signup Page**
3. **Password Reset Page**
4. **Dream Management Options**:
   - Add Dream
   - Delete Dream
   - Edit Dream
5. **View Dream Journal with Statistics**
6. **View Specific Dream**
7. **Dream Sharing Features**:
   - Share Dream to Dreamboard: A section where all shared dreams from all users are stored for registered users to see.
   - Unshare Dream: Make dreams private instead of public.
8. **Commenting System**:
   - Comment on Dreams
   - Reply to Comments
   - Reply to Other Replies
9. **Statistics**
10. **Custom Filtering**
11. **Calendar of Lucidity with Dream Views**

## Recommended IDE Setup
[VSCode](https://code.visualstudio.com/) + [C# Extension](https://marketplace.visualstudio.com/items?itemName=ms-dotnettools.csharp)

## Project Setup

1. Install dependencies:
   ```sh
   dotnet restore

   DreamJournalingApp
│
├── Features
│   ├── UserManagement
│   │   ├── User.razor               // Combines UI and logic
│   │   ├── UserService.cs
│   │   ├── UserRepository.cs
│   │   └── UserViewModel.cs
│   │
│   ├── DreamBoard
│   │   ├── DreamBoard.razor         // Combines UI and logic
│   │   ├── DreamBoardService.cs
│   │   ├── DreamBoardRepository.cs
│   │   └── DreamBoardViewModel.cs
│   │
│   ├── Chat
│   │   ├── Chat.razor               // Combines UI and logic
│   │   ├── ChatService.cs
│   │   ├── ChatRepository.cs
│   │   └── ChatViewModel.cs
│   │
│   ├── Statistics
│   │   ├── Statistics.razor         // Combines UI and logic
│   │   ├── StatisticsService.cs
│   │   ├── StatisticsRepository.cs
│   │   └── StatisticsViewModel.cs
│   │
│   ├── GoalSetting
│   │   ├── Goal.razor               // Combines UI and logic
│   │   ├── GoalService.cs
│   │   ├── GoalRepository.cs
│   │   └── GoalViewModel.cs
│   │
│   └── Comments
│       ├── Comment.razor            // Combines UI and logic
│       ├── CommentService.cs
│       ├── CommentRepository.cs
│       └── CommentViewModel.cs
│
├── Infrastructure
│   ├── DataContext.cs               // Entity Framework DbContext
│   ├── Migrations                    // Database migrations
│   ├── Repositories                  // Repositories for data access
│   │   ├── UserRepository.cs
│   │   ├── DreamBoardRepository.cs
│   │   ├── ChatRepository.cs
│   │   ├── StatisticsRepository.cs
│   │   ├── GoalRepository.cs
│   │   └── CommentRepository.cs
│   │
│   └── SeedData.cs                  // Seed data for initial setup
│
├── Shared
│   ├── Components                    // Reusable components
│   └── Models                        // Shared models or DTOs
│
└── wwwroot
    └── css                          // Static files (CSS, JS, images, etc.)

