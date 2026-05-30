def get_chatbot_response(user_input):
    user_input = user_input.lower()

    if "resume" in user_input:
        return "To build your resume, include your skills, education, and experience in detail."

    elif "job" in user_input and "find" in user_input:
        return "Which field are you looking for a job in? IT, marketing, or something else?"

    elif "interview" in user_input:
        return "To prepare for interviews, practice common questions and research the company."

    elif "thanks" in user_input or "thank you" in user_input:
        return "You're welcome! Let me know if there's anything else I can help with."

    else:
        return "I'm sorry, I don't understand that question. Could you please rephrase it?"
