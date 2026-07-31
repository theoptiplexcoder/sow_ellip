// This file is auto-generated for persistence
export const SAVED_TEMPLATES: any[] = [
  {
    "id": "t-1",
    "name": "Standard Consulting SOW",
    "description": "General-purpose template for consulting engagements.",
    "isActive": true,
    "createdAt": "2026-01-10",
    "fields": [
      {
        "key": "projectTitle",
        "kind": "text",
        "title": "Project Title",
        "description": "The title of the project.",
        "required": true,
        "readOnly": false,
        "hidden": false,
        "disabled": false,
        "width": "100"
      },
      {
        "key": "projectDescription",
        "kind": "textarea",
        "title": "Project Description",
        "description": "Detailed description of the project.",
        "required": true,
        "readOnly": false,
        "hidden": false,
        "disabled": false,
        "width": "100"
      },
      {
        "key": "overview",
        "kind": "textarea",
        "title": "Overview",
        "description": "Summarize the engagement.",
        "required": true,
        "readOnly": false,
        "hidden": false,
        "disabled": false,
        "width": "100",
        "default": "This SOW outlines..."
      },
      {
        "key": "budget",
        "kind": "currency",
        "title": "Budget (USD)",
        "required": false,
        "readOnly": false,
        "hidden": false,
        "disabled": false,
        "width": "50"
      }
    ],
    "version": 1,
    "jsonSchema": {
      "type": "object",
      "properties": {
        "projectTitle": {
          "type": "string",
          "title": "Project Title",
          "description": "The title of the project."
        },
        "projectDescription": {
          "type": "string",
          "title": "Project Description",
          "description": "Detailed description of the project."
        },
        "overview": {
          "type": "string",
          "title": "Overview",
          "description": "Summarize the engagement.",
          "default": "This SOW outlines..."
        },
        "budget": {
          "type": "number",
          "title": "Budget (USD)"
        }
      },
      "required": [
        "projectTitle",
        "projectDescription",
        "overview"
      ]
    },
    "uiSchema": {
      "projectTitle": {
        "ui:help": "The title of the project."
      },
      "projectDescription": {
        "ui:widget": "textarea",
        "ui:help": "Detailed description of the project."
      },
      "overview": {
        "ui:widget": "textarea",
        "ui:help": "Summarize the engagement."
      },
      "budget": {
        "ui:widget": "currency"
      },
      "ui:order": [
        "projectTitle",
        "projectDescription",
        "overview",
        "budget"
      ],
      "ui:layout": [
        {
          "kind": "field",
          "key": "projectTitle",
          "width": "100"
        },
        {
          "kind": "field",
          "key": "projectDescription",
          "width": "100"
        },
        {
          "kind": "field",
          "key": "overview",
          "width": "100"
        },
        {
          "kind": "field",
          "key": "budget",
          "width": "50"
        }
      ]
    },
    "defaultValues": {
      "overview": "This SOW outlines..."
    }
  },
  {
    "id": "t-2",
    "name": "Fixed-Bid Development",
    "description": "For fixed-price software delivery projects.",
    "isActive": true,
    "createdAt": "2026-02-14",
    "fields": [],
    "version": 1,
    "jsonSchema": {
      "type": "object",
      "properties": {}
    },
    "uiSchema": {
      "ui:order": [],
      "ui:layout": []
    },
    "defaultValues": {}
  },
  {
    "id": "t-3",
    "name": "Retainer v1",
    "description": "Monthly retainer agreement.",
    "isActive": false,
    "createdAt": "2026-01-22",
    "fields": [],
    "version": 1,
    "jsonSchema": {
      "type": "object",
      "properties": {}
    },
    "uiSchema": {
      "ui:order": [],
      "ui:layout": []
    },
    "defaultValues": {}
  },
  {
    "id": "t-1785402000375",
    "name": "Example 1",
    "description": "Statement of Work Examples",
    "isActive": true,
    "createdAt": "2026-07-30",
    "version": 1,
    "fields": [
      {
        "key": "field1",
        "kind": "heading",
        "title": "Pinewoods RO Treatment Plant and Wellfield Phase II",
        "required": false,
        "readOnly": false,
        "hidden": false,
        "disabled": false,
        "width": "100"
      },
      {
        "key": "introduction",
        "kind": "textarea",
        "title": "A.Introduction/Background",
        "required": false,
        "readOnly": false,
        "hidden": false,
        "disabled": false,
        "width": "100"
      },
      {
        "key": "field3",
        "kind": "textarea",
        "title": "B. Objectives",
        "required": false,
        "readOnly": false,
        "hidden": false,
        "disabled": false,
        "width": "100"
      },
      {
        "key": "Scope_of_work",
        "kind": "textarea",
        "title": "C.Scope of Work",
        "required": false,
        "readOnly": false,
        "hidden": false,
        "disabled": false,
        "width": "100"
      }
    ],
    "jsonSchema": {
      "type": "object",
      "properties": {
        "introduction": {
          "type": "string",
          "title": "A.Introduction/Background"
        },
        "field3": {
          "type": "string",
          "title": "B. Objectives"
        },
        "Scope_of_work": {
          "type": "string",
          "title": "C.Scope of Work"
        }
      }
    },
    "uiSchema": {
      "introduction": {
        "ui:widget": "textarea"
      },
      "field3": {
        "ui:widget": "textarea"
      },
      "Scope_of_work": {
        "ui:widget": "textarea"
      },
      "ui:order": [
        "introduction",
        "field3",
        "Scope_of_work"
      ],
      "ui:layout": [
        {
          "kind": "heading",
          "text": "Pinewoods RO Treatment Plant and Wellfield Phase II"
        },
        {
          "kind": "field",
          "key": "introduction",
          "width": "100"
        },
        {
          "kind": "field",
          "key": "field3",
          "width": "100"
        },
        {
          "kind": "field",
          "key": "Scope_of_work",
          "width": "100"
        }
      ]
    },
    "defaultValues": {}
  },
  {
    "id": "t-1785421219523",
    "name": "Standard SOW Approval",
    "description": "Standard SOW Approval",
    "isActive": true,
    "createdAt": "2026-07-30",
    "version": 1,
    "fields": [
      {
        "key": "field1",
        "kind": "heading",
        "title": "Standard SOW Approval",
        "required": false,
        "readOnly": false,
        "hidden": false,
        "disabled": false,
        "width": "100"
      },
      {
        "key": "field2",
        "kind": "textarea",
        "title": "Introduction",
        "required": false,
        "readOnly": false,
        "hidden": false,
        "disabled": false,
        "width": "100"
      },
      {
        "key": "field3",
        "kind": "textarea",
        "title": "Objectives",
        "required": false,
        "readOnly": false,
        "hidden": false,
        "disabled": false,
        "width": "100"
      },
      {
        "key": "field4",
        "kind": "textarea",
        "title": "Conclusion",
        "required": false,
        "readOnly": false,
        "hidden": false,
        "disabled": false,
        "width": "100"
      }
    ],
    "jsonSchema": {
      "type": "object",
      "properties": {
        "field2": {
          "type": "string",
          "title": "Introduction"
        },
        "field3": {
          "type": "string",
          "title": "Objectives"
        },
        "field4": {
          "type": "string",
          "title": "Conclusion"
        }
      }
    },
    "uiSchema": {
      "field2": {
        "ui:widget": "textarea"
      },
      "field3": {
        "ui:widget": "textarea"
      },
      "field4": {
        "ui:widget": "textarea"
      },
      "ui:order": [
        "field2",
        "field3",
        "field4"
      ],
      "ui:layout": [
        {
          "kind": "heading",
          "text": "Standard SOW Approval"
        },
        {
          "kind": "field",
          "key": "field2",
          "width": "100"
        },
        {
          "kind": "field",
          "key": "field3",
          "width": "100"
        },
        {
          "kind": "field",
          "key": "field4",
          "width": "100"
        }
      ]
    },
    "defaultValues": {}
  },
  {
    "id": "t-1785505022402",
    "name": "SAles",
    "description": "SAles",
    "isActive": true,
    "createdAt": "2026-07-31",
    "version": 1,
    "fields": [],
    "body": {
      "type": "doc",
      "content": [
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "STATEMENT OF WORK (SOW)"
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "Project Name:"
            }
          ]
        },
        {
          "type": "paragraph"
        },
        {
          "type": "paragraph"
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "Client:"
            }
          ]
        },
        {
          "type": "paragraph"
        },
        {
          "type": "paragraph"
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "Service Provider:"
            }
          ]
        },
        {
          "type": "paragraph"
        },
        {
          "type": "paragraph"
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "Project Start Date:"
            }
          ]
        },
        {
          "type": "paragraph"
        },
        {
          "type": "paragraph"
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "Project End Date:"
            }
          ]
        },
        {
          "type": "paragraph"
        },
        {
          "type": "paragraph"
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "1. Project Overview"
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "Briefly describe the purpose of the project."
            }
          ]
        },
        {
          "type": "paragraph"
        },
        {
          "type": "paragraph"
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "2. Scope of Work"
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "List the tasks and deliverables."
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "- Task 1"
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "- Task 2"
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "- Task 3"
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "3. Deliverables"
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "- Deliverable 1"
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "- Deliverable 2"
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "- Deliverable 3"
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "4. Timeline / Milestones"
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "| Milestone | Due Date | Status |"
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "|-----------|----------|--------|"
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "|           |          |        |"
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "|           |          |        |"
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "5. Roles & Responsibilities"
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "Client:"
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "- Provide required information and approvals."
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "- Review deliverables on time."
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "Service Provider:"
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "- Complete agreed tasks."
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "- Communicate project progress."
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "6. Assumptions"
            }
          ]
        },
        {
          "type": "paragraph"
        },
        {
          "type": "paragraph"
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "7. Exclusions"
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "The following are not included in this scope:"
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "- _____________________________________"
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "- _____________________________________"
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "8. Payment Terms"
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "Total Cost:"
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "_____________________________________"
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "Payment Schedule:"
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "_____________________________________"
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "9. Acceptance Criteria"
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "The project will be considered complete when:"
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "- All agreed deliverables are submitted."
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "- Client approves the final work."
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "10. Sign-Off"
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "Client Name: ______________________"
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "Signature: ________________________"
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "Date: _____________________________"
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "Service Provider Name: ______________________"
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "Signature: ________________________"
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "Date: _____________________________"
            }
          ]
        }
      ]
    },
    "jsonSchema": {
      "type": "object",
      "properties": {
        "introduction": {
          "type": "string",
          "title": "Introduction"
        }
      }
    },
    "uiSchema": {
      "introduction": {
        "ui:widget": "textarea",
        "ui:options": {
          "rows": 20
        }
      }
    },
    "defaultValues": {
      "introduction": "STATEMENT OF WORK (SOW)\n\nProject Name:\n\nClient:\n\nService Provider:\n\nProject Start Date:\n\nProject End Date:\n\n1. Project Overview\n\nBriefly describe the purpose of the project.\n\n2. Scope of Work\n\nList the tasks and deliverables.\n\n- Task 1\n\n- Task 2\n\n- Task 3\n\n3. Deliverables\n\n- Deliverable 1\n\n- Deliverable 2\n\n- Deliverable 3\n\n4. Timeline / Milestones\n\n| Milestone | Due Date | Status |\n\n|-----------|----------|--------|\n\n|           |          |        |\n\n|           |          |        |\n\n5. Roles & Responsibilities\n\nClient:\n\n- Provide required information and approvals.\n\n- Review deliverables on time.\n\nService Provider:\n\n- Complete agreed tasks.\n\n- Communicate project progress.\n\n6. Assumptions\n\n7. Exclusions\n\nThe following are not included in this scope:\n\n- _____________________________________\n\n- _____________________________________\n\n8. Payment Terms\n\nTotal Cost:\n\n_____________________________________\n\nPayment Schedule:\n\n_____________________________________\n\n9. Acceptance Criteria\n\nThe project will be considered complete when:\n\n- All agreed deliverables are submitted.\n\n- Client approves the final work.\n\n10. Sign-Off\n\nClient Name: ______________________\n\nSignature: ________________________\n\nDate: _____________________________\n\nService Provider Name: ______________________\n\nSignature: ________________________\n\nDate: _____________________________"
    }
  },
  {
    "id": "t-1785505277111",
    "name": "2020",
    "description": "General 2-step approval for standard Statements of Work.",
    "isActive": true,
    "createdAt": "2026-07-31",
    "version": 1,
    "fields": [],
    "body": {
      "type": "doc",
      "content": [
        {
          "type": "heading",
          "content": [
            {
              "type": "text",
              "text": "STATEMENT OF WORK (SOW)"
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "Project Name:"
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "_____________________________________"
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "Client:"
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "_____________________________________"
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "Service Provider:"
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "_____________________________________"
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "Project Start Date:"
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "_____________________________________"
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "Project End Date:"
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "_____________________________________"
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "1. Project Overview"
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "Briefly describe the purpose of the project."
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "_____________________________________"
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "2. Scope of Work"
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "List the tasks and deliverables."
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "- Task 1"
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "- Task 2"
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "- Task 3"
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "3. Deliverables"
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "- Deliverable 1"
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "- Deliverable 2"
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "- Deliverable 3"
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "4. Timeline / Milestones"
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "| Milestone | Due Date | Status |"
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "|-----------|----------|--------|"
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "|           |          |        |"
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "|           |          |        |"
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "5. Roles & Responsibilities"
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "Client:"
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "- Provide required information and approvals."
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "- Review deliverables on time."
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "Service Provider:"
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "- Complete agreed tasks."
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "- Communicate project progress."
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "6. Assumptions"
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "- _____________________________________"
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "- _____________________________________"
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "7. Exclusions"
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "The following are not included in this scope:"
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "- _____________________________________"
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "- _____________________________________"
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "8. Payment Terms"
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "Total Cost:"
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "_____________________________________"
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "Payment Schedule:"
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "_____________________________________"
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "9. Acceptance Criteria"
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "The project will be considered complete when:"
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "- All agreed deliverables are submitted."
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "- Client approves the final work."
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "10. Sign-Off"
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "Client Name: ______________________"
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "Signature: ________________________"
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "Date: _____________________________"
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "Service Provider Name: ______________________"
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "Signature: ________________________"
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "Date: _____________________________"
            }
          ]
        }
      ]
    },
    "jsonSchema": {
      "type": "object",
      "properties": {
        "statement_of_work_sow": {
          "type": "string",
          "title": "STATEMENT OF WORK (SOW)"
        }
      }
    },
    "uiSchema": {
      "statement_of_work_sow": {
        "ui:widget": "textarea",
        "ui:options": {
          "rows": 20
        }
      }
    },
    "defaultValues": {
      "statement_of_work_sow": "Project Name:\n\n_____________________________________\n\nClient:\n\n_____________________________________\n\nService Provider:\n\n_____________________________________\n\nProject Start Date:\n\n_____________________________________\n\nProject End Date:\n\n_____________________________________\n\n1. Project Overview\n\nBriefly describe the purpose of the project.\n\n_____________________________________\n\n2. Scope of Work\n\nList the tasks and deliverables.\n\n- Task 1\n\n- Task 2\n\n- Task 3\n\n3. Deliverables\n\n- Deliverable 1\n\n- Deliverable 2\n\n- Deliverable 3\n\n4. Timeline / Milestones\n\n| Milestone | Due Date | Status |\n\n|-----------|----------|--------|\n\n|           |          |        |\n\n|           |          |        |\n\n5. Roles & Responsibilities\n\nClient:\n\n- Provide required information and approvals.\n\n- Review deliverables on time.\n\nService Provider:\n\n- Complete agreed tasks.\n\n- Communicate project progress.\n\n6. Assumptions\n\n- _____________________________________\n\n- _____________________________________\n\n7. Exclusions\n\nThe following are not included in this scope:\n\n- _____________________________________\n\n- _____________________________________\n\n8. Payment Terms\n\nTotal Cost:\n\n_____________________________________\n\nPayment Schedule:\n\n_____________________________________\n\n9. Acceptance Criteria\n\nThe project will be considered complete when:\n\n- All agreed deliverables are submitted.\n\n- Client approves the final work.\n\n10. Sign-Off\n\nClient Name: ______________________\n\nSignature: ________________________\n\nDate: _____________________________\n\nService Provider Name: ______________________\n\nSignature: ________________________\n\nDate: _____________________________"
    }
  }
];
