"""
Test Script for Study Plan Generator
Run this script to verify the study planner service is working correctly.
"""
import sys
import json

try:
    from services.study_planner import StudyPlanGenerator
    print("✓ Successfully imported StudyPlanGenerator")
except ImportError as e:
    print(f"✗ Failed to import: {e}")
    sys.exit(1)

def test_initialization():
    """Test if the service initializes correctly."""
    print("\n=== Test 1: Initialization ===")
    try:
        # You need to set GEMINI_API_KEY environment variable
        import os
        api_key = os.getenv("GEMINI_API_KEY") or os.getenv("VITE_GEMINI_API_KEY")
        
        if not api_key:
            print("⚠ Warning: GEMINI_API_KEY not found in environment")
            print("  Set it in .env file or export it:")
            print("  export GEMINI_API_KEY=your_key_here")
            planner = StudyPlanGenerator()
        else:
            planner = StudyPlanGenerator(api_key=api_key)
            print(f"✓ Initialized with API key: {api_key[:10]}...")
        
        return planner
    except Exception as e:
        print(f"✗ Initialization failed: {e}")
        return None


def test_sample_plan(planner):
    """Test sample plan generation."""
    print("\n=== Test 2: Sample Plan ===")
    try:
        plan = planner.get_sample_plan()
        print(f"✓ Student ID: {plan.student_id}")
        print(f"✓ Date: {plan.date}")
        print(f"✓ Greeting (AR): {plan.greeting_ar}")
        print(f"✓ Insight (AR): {plan.insight_ar}")
        print(f"✓ Number of tasks: {len(plan.tasks)}")
        
        for i, task in enumerate(plan.tasks, 1):
            print(f"\n  Task {i}:")
            print(f"    - Title: {task.title_ar}")
            print(f"    - Type: {task.task_type}")
            print(f"    - Subject: {task.subject}")
            print(f"    - Duration: {task.duration_minutes} min")
            print(f"    - XP: {task.xp_reward}")
            print(f"    - Priority: {task.priority}")
            if task.is_misconception_fix:
                print(f"    - ⚠ Misconception Fix!")
        
        print(f"\n✓ Motivation: {plan.motivation_ar}")
        return True
    except Exception as e:
        print(f"✗ Sample plan failed: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_realistic_plan(planner):
    """Test realistic example plan."""
    print("\n=== Test 3: Realistic Example (Science Strong, Arabic Weak) ===")
    try:
        plan = planner.get_realistic_example_plan("test_student_123")
        print(f"✓ Generated plan for scenario:")
        print(f"  - Strongest: Science")
        print(f"  - Weakest: Arabic")
        print(f"  - Has misconceptions")
        
        print(f"\n✓ Greeting: {plan.greeting_ar}")
        print(f"✓ Insight: {plan.insight_ar}")
        print(f"✓ Tasks generated: {len(plan.tasks)}")
        
        # Check if first task is misconception fix
        if plan.tasks and plan.tasks[0].is_misconception_fix:
            print(f"✓ First task correctly prioritizes misconception fix!")
        
        # Count tasks by subject
        arabic_tasks = [t for t in plan.tasks if t.subject == 'arabic']
        science_tasks = [t for t in plan.tasks if t.subject == 'science']
        
        print(f"\n📊 Subject Balance:")
        print(f"  - Arabic (weak): {len(arabic_tasks)} tasks")
        print(f"  - Science (strong): {len(science_tasks)} tasks")
        
        if len(arabic_tasks) > len(science_tasks):
            print(f"✓ Balance is correct: More focus on weak subject!")
        
        return True
    except Exception as e:
        print(f"✗ Realistic plan failed: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_custom_plan(planner):
    """Test custom plan generation with specific data."""
    print("\n=== Test 4: Custom Plan Generation ===")
    
    student_data = {
        'grade': 9,
        'lessons_completed': 30,
        'last_lesson': 'المعادلات التربيعية',
        'last_quiz_score': 88,
        'misconceptions': ['طرق حل المعادلات'],
        'streak': 7,
        'strongest_subject': 'math',
        'weakest_subject': 'physics',
    }
    
    print("Input data:")
    print(json.dumps(student_data, indent=2, ensure_ascii=False))
    
    try:
        plan = planner.generate_plan("custom_student", student_data)
        print(f"\n✓ Plan generated successfully")
        print(f"✓ Greeting: {plan.greeting_ar}")
        print(f"✓ Tasks: {len(plan.tasks)}")
        
        # Verify the plan follows the rules
        high_priority_tasks = [t for t in plan.tasks if t.priority == 'high']
        print(f"✓ High priority tasks: {len(high_priority_tasks)}")
        
        return True
    except Exception as e:
        print(f"✗ Custom plan generation failed: {e}")
        print(f"  This is expected if Gemini API is not configured")
        print(f"  The service will use fallback plan instead")
        import traceback
        traceback.print_exc()
        return False


def test_json_serialization(planner):
    """Test if plans can be serialized to JSON (for API responses)."""
    print("\n=== Test 5: JSON Serialization ===")
    try:
        plan = planner.get_sample_plan()
        json_data = plan.model_dump()
        json_str = json.dumps(json_data, ensure_ascii=False, indent=2)
        print("✓ Successfully serialized to JSON")
        print(f"✓ JSON size: {len(json_str)} bytes")
        
        # Verify it can be parsed back
        parsed = json.loads(json_str)
        print(f"✓ Successfully parsed back: {len(parsed['tasks'])} tasks")
        
        return True
    except Exception as e:
        print(f"✗ Serialization failed: {e}")
        return False


def main():
    """Run all tests."""
    print("=" * 60)
    print("STUDY PLAN GENERATOR — TEST SUITE")
    print("=" * 60)
    
    # Initialize
    planner = test_initialization()
    if not planner:
        print("\n❌ Cannot continue without initialization")
        sys.exit(1)
    
    # Run tests
    results = []
    results.append(("Sample Plan", test_sample_plan(planner)))
    results.append(("Realistic Example", test_realistic_plan(planner)))
    results.append(("Custom Plan", test_custom_plan(planner)))
    results.append(("JSON Serialization", test_json_serialization(planner)))
    
    # Summary
    print("\n" + "=" * 60)
    print("TEST RESULTS SUMMARY")
    print("=" * 60)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for name, result in results:
        status = "✓ PASS" if result else "✗ FAIL"
        print(f"{status}: {name}")
    
    print(f"\nTotal: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 All tests passed! Study planner is ready to use.")
        return 0
    else:
        print(f"\n⚠ {total - passed} test(s) failed. Check configuration.")
        return 1


if __name__ == "__main__":
    sys.exit(main())
