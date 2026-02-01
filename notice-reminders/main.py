import asyncio
import sys
from swayam_client import SwayamClient
from models import Course


async def main():
    client = SwayamClient()

    print("Welcome to MOOC Course Search & Announcement Fetcher")
    print("----------------------------------------------------")

    while True:
        query = input("\nEnter search query (or 'q' to quit): ").strip()
        if query.lower() == "q":
            break

        if not query:
            continue

        print(f"Searching for '{query}'...")

        try:
            courses = await client.search_courses(query)
        except Exception as e:
            print(f"Error searching courses: {e}")
            continue

        if not courses:
            print("No courses found.")
            continue

        print(f"\nFound {len(courses)} courses:")
        for i, course in enumerate(courses, 1):
            print(f"{i}. {course}")

        choice = input(
            "\nSelect course number to view announcements (or 'c' to cancel): "
        ).strip()
        if choice.lower() == "c":
            continue

        try:
            idx = int(choice) - 1
            if 0 <= idx < len(courses):
                selected_course = courses[idx]
                print(
                    f"\nFetching announcements for: {selected_course.title} ({selected_course.code})..."
                )

                try:
                    announcements = await client.get_announcements(selected_course.code)

                    if not announcements:
                        print("No announcements found.")
                    else:
                        print(f"\n=== Announcements for {selected_course.title} ===")
                        for ann in announcements:
                            print(ann)
                except Exception as e:
                    print(f"Error fetching announcements: {e}")
            else:
                print("Invalid selection.")
        except ValueError:
            print("Invalid input.")


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\nGoodbye!")
        sys.exit(0)
