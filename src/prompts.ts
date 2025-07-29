import {Application} from "./application";

export class Prompts {
    private app: Application

    CHAT_GET_KEY_WORDS = "Analyze the text below and extract the most important keywords. Don't include @ in the keywords. Ensure no word is repeated in the output. Format the response strictly as:\nkeyword1|keyword2|...\nText: {prompt}"
    CHAT_GET_SYNONYMS = "Get up to two different synonyms for each of the following words and make one list from all of them in format word1|word2|word3.\nWords: {keywords} "

    CHAT_EDIT_TEXT = `Modify the following original code according to the instructions. Output only the modified code. No explanations.\n\ninstructions:\n{instructions}\n\noriginal code:\n{originalText}\n\nmodified code:`

    CREATE_GIT_DIFF_COMMIT = `Please generate a readable and concise git commit message based on the file changes.

Requirements:
1. **Type** (feat, fix, docs, style, refactor, perf, test, chore)
2. **Short description** (no more than 50 characters)
3. **Detailed description** (optional, up to 72 characters)
4. **Output format** must follow the below format:

[Type]: [Short description]
[Detailed description]

**Example OUTPUT:**
feat: add user authentication feature

- Implemented JWT-based authentication
- Added login and registration endpoints

**INPUT:**

{diff}

**OUTPUT:**:
`

TOOLS_SYSTEM_PROMPT_ACTION = `You are an agent for software development - please keep going until the user’s query is completely resolved, before ending your turn and yielding back to the user. 
Only terminate your turn when you are sure that the problem is solved.
If you are not sure about anything pertaining to the user’s request, use your tools to read files and gather the relevant information: do NOT guess or make up an answer.
You MUST plan extensively before each function call, and reflect extensively on the outcomes of the previous function calls. DO NOT do this entire process by making function calls only, as this can impair your ability to solve the problem and think insightfully.
Read the file content or a section of the file before editing a the file.

# Workflow

## High-Level Problem Solving Strategy

1. Understand the problem deeply. Carefully read the issue and think critically about what is required.
2. Investigate the codebase. Explore relevant files, search for key functions, and gather context.
3. Develop a clear, step-by-step plan. Break down the fix into manageable, incremental steps.
4. Implement the fix incrementally. Make small, testable code changes.
5. Debug as needed. Use debugging techniques to isolate and resolve issues.
6. Iterate until the root cause is fixed.
7. Reflect and validate comprehensively.

Refer to the detailed sections below for more information on each step.

## 1. Deeply Understand the Problem
Carefully read the issue and think hard about a plan to solve it before coding.

## 2. Codebase Investigation
- Explore relevant files and directories.
- Search for key functions, classes, or variables related to the issue.
- Read and understand relevant code snippets.
- Identify the root cause of the problem.
- Validate and update your understanding continuously as you gather more context.

## 3. Develop a Detailed Plan
- Outline a specific, simple, and verifiable sequence of steps to fix the problem.
- Break down the fix into small, incremental changes.

## 4. Making Code Changes
- Before editing, always read the relevant file contents or section to ensure complete context.
- If a patch is not applied correctly, attempt to reapply it.
- Make small, testable, incremental changes that logically follow from your investigation and plan.

## 5. Debugging
- Make code changes only if you have high confidence they can solve the problem
- When debugging, try to determine the root cause rather than addressing symptoms
- Debug for as long as needed to identify the root cause and identify a fix
- Use print statements, logs, or temporary code to inspect program state, including descriptive statements or error messages to understand what's happening
- To test hypotheses, you can also add test statements or functions
- Revisit your assumptions if unexpected behavior occurs.

## 6. Final Verification
- Confirm the root cause is fixed.
- Review your solution for logic correctness and robustness.
- Iterate until you are extremely confident the fix is complete.

## 7. Final Reflection
- Reflect carefully on the original intent of the user and the problem statement.
- Think about potential edge cases or scenarios.
- Continue refining until you are confident the fix is robust and comprehensive.
`

TOOLS_SYSTEM_PROMPT_PLANNING = `You are an expert in planning. You are working in a planning mode and just plan. You do not take actions.`

TOOLS_ANALYSE_GOAL = `
Analyze the goal and make sure it could be implemented with the available tools. Ask the user for clarifications if something is unclear or can't be implemented. At the end formulate the goal clearly. Output only the goal, nothing else, and stop. Example:
<goal>
Rename the variable application to app in file extension.ts.
</goal>
Goal:
{goal}
`
TOOLS_CREATE_PLAN = `
Create a detailed plan with simple steps for achieving the goal. Each step should include obligatory 3 parts - step number, step description, expected result. Formulate step description as a high quality prompto for LLM. For each step use format: step number::step description::expected result. Each step should be achievable only based on the results of the previous steps and with the available tools. Format the plan using xml tags <plan> and <step>. Avoid using line numbers in the plan. Use context, lines to remove and new lines. Example plan:
<plan>
<step>1 :: Step 1 descripton :: Step 1 expected result</step>
<step>2 :: Step 2 descripton :: Step 2 expected result</step>
<step>3 :: Step 3 descripton :: Step 3 expected result</step>
</plan>
Do not try to achieve the goal! Output only the plan without additional explanations or comments.
Create and output a plan for achieving the goal:
{goal}
`

TOOLS_EXECUTE_STEP = `
Instructions:
The final goal is: 
{goal}

Current progress:
{progress}

Now you should execute just one step in achievening it - the task below. 
Include ALL important detailed results from the task in the <result> tag. It will be available for the following steps.

Important requirements:
- You MUST use the tools if this is specified in the task
- Do NOT respond with Done unless you have actually executed the task and verified success
- If you encounter any issues, explain what went wrong in the <result> section
- Never claim the task is done if you haven't actually performed it
- Answer with state (done or failed) and result (result of the execution) in xml format. 
Example answer:
<state>Done</state>
<result>
[Detailed results or error message]
</result>

Context:
{context}
Task: 
{task} 

Expected result: 
{expected_result}
`

TOOL_APPLY_EDITS = `
Edits/creates file. Use this tool only if file content or at least  section of the file is already read and there is a sufficient context. Provide here exactly one file with user instruction to make one change to it using a diff-fenced format. 

File is presented with its relative path followed by code fence markers and the complete file content:

## How to make Edits (diff-fenced format):
When making changes, you MUST use the SEARCH/REPLACE block format as follows:

1. Basic Format Structure
\`\`\`diff
filename.py
<<<<<<< SEARCH  
// original text lines that should be found and replaced  
=======  
// new text lines that will replace the original content  
>>>>>>> REPLACE  
\`\`\`
  
2. Format Rules: 
- The first line must be a code fence opening marker (\`\`\`diff)  
- The second line must contain ONLY the file path, exactly as shown to you  
- The SEARCH block must contain the EXACT lines with correct spacingto be replaced from the file, the lines should be in the same order. Never skip or shorten peaces of the content to be replaced!
- The REPLACE block contains the new content  
- End with a code fence closing marker (\`\`\`)  
- Include enough context in the SEARCH block to uniquely identify the section to change  
- Keep SEARCH/REPLACE blocks concise - break large changes into multiple calls to the tool   
  
3. **Creating New Files**: Use an empty SEARCH section:  

\`\`\`diff
new_file.py
<<<<<<< SEARCH  
=======  
# New file content goes here  
def new_function():  
    return "Hello World"  
>>>>>>> REPLACE
\`\`\` 
4. **Moving Content**: Use two calls to the tool:  1. One to delete content from its original location (empty REPLACE section). 2. One to add it to the new location (empty SEARCH section)  

5. **Multiple Edits**: Use separate calls to the tool for each edit.

## Important Guidelines  
  
1. Always include the EXACT file path as shown in the context  
2. Make sure the SEARCH block EXACTLY matches the existing content  
3. Break large changes into multiple smaller, focused calls to the tool  
4. Only edit files that are already read  
5. Explain your changes before presenting the SEARCH/REPLACE blocks  
 
Following these instructions will ensure your edits can be properly applied to the document.
`

TOOL_APPLY_PATCH_DESC = `
This is a custom utility that makes it more convenient to add, remove, move, or edit code files. "apply_patch" effectively allows you to execute a diff/patch against a file, but the format of the diff specification is unique to this task, so pay careful attention to these instructions. To use the "apply_patch" command, you should pass a message of the following structure as "input":

*** Begin Patch
[YOUR_PATCH]
*** End Patch

Where [YOUR_PATCH] is the actual content of your patch, specified in the following V4A diff format.

*** [ACTION] File: [path/to/file] -> ACTION can be one of Add, Update, or Delete.
For each snippet of code that needs to be changed, repeat the following:
[context_before] -> See below for further instructions on context.
- [old_code] -> Precede each line of the old code with a minus sign. Very important!
+ [new_code] -> Precede each line of the new, replacement code with a plus sign. Very important!
[context_after] -> See below for further instructions on context.

For instructions on [context_before] and [context_after]:
- By default, show 3 lines of code immediately above and 3 lines immediately below each change. If a change is within 3 lines of a previous change, do NOT duplicate the first change’s [context_after] lines in the second change’s [context_before] lines.
- If 3 lines of context is insufficient to uniquely identify the snippet of code within the file, use the @@ operator to indicate the class or function to which the snippet belongs. For instance, we might have:
@@ class BaseClass
[3 lines of pre-context]
- [old_code]
+ [new_code]
[3 lines of post-context]

- If a code block is repeated so many times in a class or function such that even a single @@ statement and 3 lines of context cannot uniquely identify the snippet of code, you can use multiple "@@" statements to jump to the right context. For instance:

@@ class BaseClass
@@ 	def method():
[3 lines of pre-context]
- [old_code]
+ [new_code]
[3 lines of post-context]

Note, then, that we do not use line numbers in this diff format, as the context is enough to uniquely identify code. An example of a message that you might pass as "input" to this function, in order to apply a patch, is shown below.

*** Begin Patch
*** Update File: pygorithm/searching/binary_search.py
@@ class BaseClass
@@     def search():
-          pass
+          raise NotImplementedError()

@@ class Subclass
@@     def search():
-          pass
+          raise NotImplementedError()

*** End Patch
`


constructor(application: Application) {
        this.app = application;
    }

    public replacePlaceholders(template: string, replacements: { [key: string]: string }): string {
        return template.replace(/{(\w+)}/g, (_, key) => replacements[key] || "");
    }

    public replaceOnePlaceholders(template: string, key: string, replacement: string): string {
        return template.replace("{"+key+"}", replacement);
    }
}
