import { type FlowModel } from "./flow-chart/flow-model";

const sampleFlowModel: FlowModel = {
  nodes: [
    // ── OPENING ──────────────────────────────────────────────
    {
      id: "opening",
      type: "say",
      position: { x: 0, y: 0 },
      data: {
        name: "Opening",
        static: false,
        prompt:
          "I saw you reached out regarding {{form_description || 'improving your workflows'}}, how are you doing today?",
        waitForResponse: true,
      },
    },

    // ── THE FRAME ────────────────────────────────────────────
    {
      id: "frame",
      type: "say",
      position: { x: 0, y: 100 },
      data: {
        name: "The Frame",
        static: true,
        prompt:
          "The goal for today is just to clarify a few details so I can connect you to the right product consultant. By the way, this call is recorded.",
        waitForResponse: false,
      },
    },

    // ── THE HOOK ─────────────────────────────────────────────
    {
      id: "hook",
      type: "say",
      position: { x: 0, y: 200 },
      data: {
        name: "The Hook",
        static: true,
        prompt:
          "Just to start—I have your notes here—but in your own words, what was the main trigger that brought you to monday?",
        waitForResponse: true,
      },
    },

    // ── CLASSIFY INTENT ──────────────────────────────────────
    {
      id: "classify_intent",
      type: "ask",
      position: { x: 0, y: 300 },
      data: {
        name: "Classify Intent",
        static: false,
        prompt:
          "Based on the user's answer to the hook, classify their intent.",
        field: {
          name: "intent_type",
          type: "enum",
          enum: ["qualification", "support_billing_troubleshooting"],
        },
        exits: [
          { name: "qualification", value: "qualification" },
          {
            name: "non_qualification",
            value: "support_billing_troubleshooting",
          },
        ],
      },
    },

    // ── NON-QUALIFICATION REQUEST ────────────────────────────
    {
      id: "non_qualification",
      type: "say",
      position: { x: -400, y: 400 },
      data: {
        name: "Non-Qualification Deflection",
        static: true,
        prompt:
          "Unfortunately I'm unable to assist you with that. However, I'm going to raise a ticket now with our support team, and they will reach out to you momentarily via email.",
        waitForResponse: false,
      },
    },

    // ── CLASSIFY PERSONA ─────────────────────────────────────
    {
      id: "classify_persona",
      type: "ask",
      position: { x: 0, y: 400 },
      data: {
        name: "Classify Persona",
        static: false,
        prompt:
          "Based on how the user described their trigger, classify them as Explorer (vague, high-level, just browsing) or Sprinter (specific, urgent, clear use-case).",
        field: {
          name: "persona",
          type: "enum",
          enum: ["explorer", "sprinter"],
        },
        exits: [
          { name: "explorer", value: "explorer" },
          { name: "sprinter", value: "sprinter" },
        ],
      },
    },

    // ── STEP 1: IDENTIFY NEED (EXPLORER) ─────────────────────
    {
      id: "need_explorer",
      type: "say",
      position: { x: -200, y: 550 },
      data: {
        name: "Identify Need (Explorer)",
        static: true,
        prompt:
          "That's interesting. What's the specific breaking point in your current process that you're hoping to address with monday?",
        waitForResponse: true,
      },
    },

    // ── STEP 1: IDENTIFY NEED (SPRINTER) ─────────────────────
    {
      id: "need_sprinter",
      type: "say",
      position: { x: 200, y: 550 },
      data: {
        name: "Identify Need (Sprinter)",
        static: true,
        prompt:
          "Got it. And strictly regarding your role—are you setting this up for your own team or the whole company?",
        waitForResponse: true,
      },
    },

    // ── CHECK COMPETITOR MENTION ─────────────────────────────
    {
      id: "check_competitor",
      type: "ask",
      position: { x: 0, y: 700 },
      data: {
        name: "Check Competitor Mention",
        static: false,
        prompt:
          "Did the user mention any competitor tool in their answer? Classify which category.",
        field: {
          name: "competitor_mentioned",
          type: "enum",
          enum: ["asana_trello_clickup", "jira_salesforce_other", "none"],
          optional: true,
        },
        exits: [
          {
            name: "post_it_jab",
            value: "asana_trello_clickup",
            acknowledge:
              "That's great, but I like to say it's like bringing a Post-it to a systems fight.",
          },
          { name: "neutral_competitor", value: "jira_salesforce_other" },
          { name: "no_competitor", value: "none" },
        ],
      },
    },

    // ── STEP 1B: CURRENT STACK (EXPLORER) ────────────────────
    {
      id: "stack_explorer",
      type: "say",
      position: { x: -200, y: 850 },
      data: {
        name: "Current Stack (Explorer)",
        static: true,
        prompt: "What are you using today to run this process?",
        waitForResponse: true,
      },
    },

    // ── STEP 1B: CURRENT STACK (SPRINTER) ────────────────────
    {
      id: "stack_sprinter",
      type: "say",
      position: { x: 200, y: 850 },
      data: {
        name: "Current Stack (Sprinter)",
        static: true,
        prompt: "Quick check—are you moving off of any software right now?",
        waitForResponse: true,
      },
    },

    // ── STACK FOLLOW-UP (EXPLORER ONLY) ──────────────────────
    {
      id: "stack_followup_check",
      type: "ask",
      position: { x: -200, y: 950 },
      data: {
        name: "Stack Follow-Up Needed?",
        static: false,
        prompt:
          "Did the user mention Excel or a competitor? If so, a follow-up is needed to understand what's missing.",
        field: {
          name: "needs_stack_followup",
          type: "boolean",
        },
        exits: [
          { name: "yes", value: "true" },
          { name: "no", value: "false" },
        ],
      },
    },

    {
      id: "stack_followup",
      type: "say",
      position: { x: -350, y: 1050 },
      data: {
        name: "Stack Follow-Up",
        static: true,
        prompt: "What's missing or not working with that setup today?",
        waitForResponse: true,
      },
    },

    // ── CHECK COMPETITOR IN STACK ANSWER ─────────────────────
    {
      id: "check_competitor_stack",
      type: "ask",
      position: { x: 0, y: 1100 },
      data: {
        name: "Check Competitor in Stack Answer",
        static: false,
        prompt:
          "Did the user mention Asana, Trello, or ClickUp in their stack answer?",
        field: {
          name: "stack_competitor",
          type: "enum",
          enum: ["asana_trello_clickup", "jira_salesforce_other", "none"],
          optional: true,
        },
        exits: [
          {
            name: "post_it_jab",
            value: "asana_trello_clickup",
            acknowledge:
              "That's great, but I like to say it's like bringing a Post-it to a systems fight.",
          },
          { name: "neutral_competitor", value: "jira_salesforce_other" },
          { name: "no_competitor", value: "none" },
        ],
      },
    },

    // ── NEED GATE CHECK (internal) ───────────────────────────
    {
      id: "need_gate",
      type: "ask",
      position: { x: 0, y: 1200 },
      data: {
        name: "Need Gate",
        static: false,
        prompt:
          "Has the user expressed a valid workflow pain point or product interest (CRM, Dev, Service, or Work Mgmt)? This must NOT be a support/billing/troubleshooting request.",
        field: {
          name: "need_identified",
          type: "boolean",
        },
        exits: [
          { name: "need_met", value: "true" },
          { name: "need_not_met", value: "false" },
        ],
      },
    },

    // ── USER COUNT QUESTION ──────────────────────────────────
    {
      id: "ask_user_count",
      type: "say",
      position: { x: 0, y: 1350 },
      data: {
        name: "Ask User Count",
        static: true,
        prompt: "How many people would use monday day to day?",
        waitForResponse: true,
      },
    },

    // ── PARSE USER COUNT ─────────────────────────────────────
    {
      id: "parse_user_count",
      type: "ask",
      position: { x: 0, y: 1450 },
      data: {
        name: "Parse User Count",
        static: false,
        prompt:
          "Did the user provide a single clear number, a vague range/approximation, or refuse to answer?",
        field: {
          name: "user_count_clarity",
          type: "enum",
          enum: ["exact_number", "range_or_vague", "refused"],
        },
        exits: [
          { name: "exact", value: "exact_number" },
          { name: "vague", value: "range_or_vague" },
          { name: "refused", value: "refused" },
        ],
      },
    },

    // ── CLARIFY RANGE ────────────────────────────────────────
    {
      id: "clarify_range",
      type: "say",
      position: { x: -200, y: 1550 },
      data: {
        name: "Clarify Range",
        static: false,
        prompt:
          "What number should I use — {{range_low}}, {{range_mid}}, or {{range_high}}?",
        waitForResponse: true,
      },
    },

    // ── USER COUNT GATE CHECK ────────────────────────────────
    {
      id: "user_count_gate",
      type: "ask",
      position: { x: 0, y: 1650 },
      data: {
        name: "User Count Gate",
        static: false,
        prompt:
          "Is the confirmed user count >= the qualification threshold ({{_number_of_users_to_qualify_}})?",
        field: {
          name: "count_qualified",
          type: "boolean",
        },
        exits: [
          { name: "qualified", value: "true" },
          { name: "under_threshold", value: "false" },
        ],
      },
    },

    // ── EXPANSION: WORKFLOW PROBE ────────────────────────────
    {
      id: "expansion_workflow_probe",
      type: "say",
      position: { x: 200, y: 1750 },
      data: {
        name: "Expansion — Workflow Probe",
        static: true,
        prompt:
          "Got it. And regarding the workflow—is this group working independently, or do they need to collaborate with other departments?",
        waitForResponse: true,
      },
    },

    // ── EXPANSION: CLASSIFY COLLABORATION ────────────────────
    {
      id: "expansion_collab_check",
      type: "ask",
      position: { x: 200, y: 1850 },
      data: {
        name: "Expansion — Collaboration Check",
        static: false,
        prompt:
          "Did the user indicate collaboration with other departments, or that the team works independently?",
        field: {
          name: "collaboration",
          type: "enum",
          enum: ["collaborative", "independent"],
        },
        exits: [
          { name: "collaborative", value: "collaborative" },
          { name: "independent", value: "independent" },
        ],
      },
    },

    // ── EXPANSION PIVOT (COLLABORATIVE) ──────────────────────
    {
      id: "expansion_pivot_collab",
      type: "say",
      position: { x: 100, y: 1950 },
      data: {
        name: "Expansion Pivot (Collaborative)",
        static: true,
        prompt:
          "Does that mean you're planning to onboard those other teams to monday as well?",
        waitForResponse: true,
      },
    },

    // ── EXPANSION PIVOT (INDEPENDENT) ────────────────────────
    {
      id: "expansion_pivot_independent",
      type: "say",
      position: { x: 350, y: 1950 },
      data: {
        name: "Expansion Pivot (Independent)",
        static: true,
        prompt: "So it would likely stay just within your team for now?",
        waitForResponse: true,
      },
    },

    // ── EXPANSION CONFIRMATION ───────────────────────────────
    {
      id: "expansion_confirmed_check",
      type: "ask",
      position: { x: 200, y: 2100 },
      data: {
        name: "Expansion Confirmed?",
        static: false,
        prompt: "Did the user confirm they plan to expand to other teams?",
        field: {
          name: "expansion_confirmed",
          type: "boolean",
        },
        exits: [
          { name: "yes_expansion", value: "true" },
          { name: "no_expansion", value: "false" },
        ],
      },
    },

    // ── TIMELINE CHECK ───────────────────────────────────────
    {
      id: "timeline_check",
      type: "say",
      position: { x: 100, y: 2200 },
      data: {
        name: "Timeline Check",
        static: true,
        prompt:
          "Is that rollout something planned for the next 3 months, or is that further down the road?",
        waitForResponse: true,
      },
    },

    // ── TIMELINE GATE ────────────────────────────────────────
    {
      id: "timeline_gate",
      type: "ask",
      position: { x: 100, y: 2300 },
      data: {
        name: "Timeline Gate",
        static: false,
        prompt:
          "Did the user confirm the expansion is planned within the next 3 months?",
        field: {
          name: "within_3_months",
          type: "boolean",
        },
        exits: [
          { name: "within_3_months", value: "true" },
          { name: "further_out", value: "false" },
        ],
      },
    },

    // ── TOTAL COUNT (EXPANSION) ──────────────────────────────
    {
      id: "ask_total_count",
      type: "say",
      position: { x: 100, y: 2400 },
      data: {
        name: "Ask Total Count (Expansion)",
        static: true,
        prompt:
          "So including that next wave, what is the total user count we should plan for?",
        waitForResponse: true,
      },
    },

    // ── FINAL MATH CHECK ─────────────────────────────────────
    {
      id: "final_math_check",
      type: "ask",
      position: { x: 200, y: 2500 },
      data: {
        name: "Final Math Check",
        static: false,
        prompt:
          "Is the total qualified user count (current or expanded) >= {{_number_of_users_to_qualify_}}?",
        field: {
          name: "final_qualified",
          type: "boolean",
        },
        exits: [
          { name: "qualified", value: "true" },
          { name: "unqualified", value: "false" },
        ],
      },
    },

    // ── QUALIFIED HANDOFF ────────────────────────────────────
    {
      id: "qualified_handoff",
      type: "say",
      position: { x: 0, y: 2700 },
      data: {
        name: "Qualified Handoff",
        static: true,
        prompt:
          "Got it — thanks. I'm going to ask a couple quick questions to make sure I connect you with the right product consultant.",
        waitForResponse: false,
      },
    },

    // ── EXIT: ENRICHMENT ─────────────────────────────────────
    {
      id: "exit_enrichment",
      type: "exit",
      position: { x: 0, y: 2800 },
      data: { name: "Transfer to Enrichment" },
    },

    // ── EXIT: SOFT LETDOWN ───────────────────────────────────
    {
      id: "exit_soft_letdown",
      type: "exit",
      position: { x: 400, y: 2800 },
      data: { name: "Transfer to Soft Letdown" },
    },

    // ── EXIT: SUPPORT TICKET ─────────────────────────────────
    {
      id: "exit_support",
      type: "exit",
      position: { x: -400, y: 500 },
      data: { name: "Support Ticket Raised" },
    },
  ],

  edges: [
    // Opening -> Frame
    {
      id: "e-opening-frame",
      source: "opening",
      target: "frame",
      data: { kind: "transition", name: "after_greeting" },
    },
    // Frame -> Hook
    {
      id: "e-frame-hook",
      source: "frame",
      target: "hook",
      data: { kind: "transition", name: "to_hook" },
    },
    // Hook -> Classify Intent
    {
      id: "e-hook-classify",
      source: "hook",
      target: "classify_intent",
      data: { kind: "transition", name: "classify_response" },
    },
    // Classify Intent -> Non-Qualification
    {
      id: "e-classify-nonqual",
      source: "classify_intent",
      target: "non_qualification",
      data: {
        kind: "transition",
        name: "non_qualification",
        conditions: "intent_type == 'support_billing_troubleshooting'",
      },
    },
    // Non-Qualification -> Exit Support
    {
      id: "e-nonqual-exit",
      source: "non_qualification",
      target: "exit_support",
      data: { kind: "transition", name: "raise_ticket" },
    },
    // Classify Intent -> Classify Persona
    {
      id: "e-classify-persona",
      source: "classify_intent",
      target: "classify_persona",
      data: {
        kind: "transition",
        name: "qualification_path",
        conditions: "intent_type == 'qualification'",
      },
    },
    // Classify Persona -> Need Explorer
    {
      id: "e-persona-explorer",
      source: "classify_persona",
      target: "need_explorer",
      data: {
        kind: "transition",
        name: "explorer",
        conditions: "persona == 'explorer'",
      },
    },
    // Classify Persona -> Need Sprinter
    {
      id: "e-persona-sprinter",
      source: "classify_persona",
      target: "need_sprinter",
      data: {
        kind: "transition",
        name: "sprinter",
        conditions: "persona == 'sprinter'",
      },
    },
    // Need Explorer -> Check Competitor
    {
      id: "e-need-explorer-competitor",
      source: "need_explorer",
      target: "check_competitor",
      data: { kind: "transition", name: "check_for_competitors" },
    },
    // Need Sprinter -> Check Competitor
    {
      id: "e-need-sprinter-competitor",
      source: "need_sprinter",
      target: "check_competitor",
      data: { kind: "transition", name: "check_for_competitors" },
    },
    // Check Competitor -> Stack Explorer (explorer path)
    {
      id: "e-competitor-stack-explorer",
      source: "check_competitor",
      target: "stack_explorer",
      data: {
        kind: "transition",
        name: "to_stack_explorer",
        conditions: "persona == 'explorer'",
        prompt:
          "If competitor was asana_trello_clickup, the Post-it jab has been delivered via acknowledge. Continue to stack question.",
      },
    },
    // Check Competitor -> Stack Sprinter (sprinter path)
    {
      id: "e-competitor-stack-sprinter",
      source: "check_competitor",
      target: "stack_sprinter",
      data: {
        kind: "transition",
        name: "to_stack_sprinter",
        conditions: "persona == 'sprinter'",
      },
    },
    // Stack Explorer -> Stack Follow-Up Check
    {
      id: "e-stack-explorer-followup",
      source: "stack_explorer",
      target: "stack_followup_check",
      data: { kind: "transition", name: "check_followup_needed" },
    },
    // Stack Follow-Up Check -> Stack Follow-Up (yes)
    {
      id: "e-followup-yes",
      source: "stack_followup_check",
      target: "stack_followup",
      data: {
        kind: "transition",
        name: "followup_needed",
        conditions: "needs_stack_followup == true",
      },
    },
    // Stack Follow-Up Check -> Check Competitor Stack (no)
    {
      id: "e-followup-no",
      source: "stack_followup_check",
      target: "check_competitor_stack",
      data: {
        kind: "transition",
        name: "no_followup",
        conditions: "needs_stack_followup == false",
      },
    },
    // Stack Follow-Up -> Check Competitor Stack
    {
      id: "e-followup-competitor",
      source: "stack_followup",
      target: "check_competitor_stack",
      data: {
        kind: "transition",
        name: "after_followup",
      },
    },
    // Stack Sprinter -> Check Competitor Stack
    {
      id: "e-stack-sprinter-competitor",
      source: "stack_sprinter",
      target: "check_competitor_stack",
      data: { kind: "transition", name: "check_stack_competitors" },
    },
    // Check Competitor Stack -> Need Gate
    {
      id: "e-competitor-stack-need-gate",
      source: "check_competitor_stack",
      target: "need_gate",
      data: {
        kind: "transition",
        name: "to_need_gate",
        prompt:
          "If competitor was asana_trello_clickup, the Post-it jab has been delivered via acknowledge.",
      },
    },
    // Need Gate -> Ask User Count (need met)
    {
      id: "e-need-met-count",
      source: "need_gate",
      target: "ask_user_count",
      data: {
        kind: "transition",
        name: "need_met",
        conditions: "need_identified == true",
      },
    },
    // Need Gate -> Soft Letdown (need not met)
    {
      id: "e-need-not-met",
      source: "need_gate",
      target: "exit_soft_letdown",
      data: {
        kind: "transition",
        name: "need_not_met",
        conditions: "need_identified == false",
      },
    },
    // Ask User Count -> Parse User Count
    {
      id: "e-count-parse",
      source: "ask_user_count",
      target: "parse_user_count",
      data: { kind: "transition", name: "parse_count" },
    },
    // Parse -> Clarify Range (vague)
    {
      id: "e-parse-clarify",
      source: "parse_user_count",
      target: "clarify_range",
      data: {
        kind: "transition",
        name: "clarify_vague",
        conditions: "user_count_clarity == 'range_or_vague'",
      },
    },
    // Clarify Range -> User Count Gate
    {
      id: "e-clarify-gate",
      source: "clarify_range",
      target: "user_count_gate",
      data: { kind: "transition", name: "after_clarify" },
    },
    // Parse -> User Count Gate (exact)
    {
      id: "e-parse-gate-exact",
      source: "parse_user_count",
      target: "user_count_gate",
      data: {
        kind: "transition",
        name: "exact_to_gate",
        conditions: "user_count_clarity == 'exact_number'",
      },
    },
    // Parse -> Soft Letdown (refused)
    {
      id: "e-parse-refused",
      source: "parse_user_count",
      target: "exit_soft_letdown",
      data: {
        kind: "transition",
        name: "refused_count",
        conditions: "user_count_clarity == 'refused'",
      },
    },
    // User Count Gate -> Qualified Handoff (meets threshold)
    {
      id: "e-gate-qualified",
      source: "user_count_gate",
      target: "qualified_handoff",
      data: {
        kind: "transition",
        name: "count_qualified",
        conditions: "count_qualified == true",
      },
    },
    // User Count Gate -> Expansion Workflow Probe (under threshold)
    {
      id: "e-gate-expansion",
      source: "user_count_gate",
      target: "expansion_workflow_probe",
      data: {
        kind: "transition",
        name: "under_threshold_expand",
        conditions: "count_qualified == false",
      },
    },
    // Expansion Workflow Probe -> Collaboration Check
    {
      id: "e-probe-collab",
      source: "expansion_workflow_probe",
      target: "expansion_collab_check",
      data: { kind: "transition", name: "classify_collaboration" },
    },
    // Collab Check -> Pivot Collaborative
    {
      id: "e-collab-pivot",
      source: "expansion_collab_check",
      target: "expansion_pivot_collab",
      data: {
        kind: "transition",
        name: "collaborative",
        conditions: "collaboration == 'collaborative'",
      },
    },
    // Collab Check -> Pivot Independent
    {
      id: "e-indep-pivot",
      source: "expansion_collab_check",
      target: "expansion_pivot_independent",
      data: {
        kind: "transition",
        name: "independent",
        conditions: "collaboration == 'independent'",
      },
    },
    // Pivot Collaborative -> Expansion Confirmed Check
    {
      id: "e-pivot-collab-confirm",
      source: "expansion_pivot_collab",
      target: "expansion_confirmed_check",
      data: { kind: "transition", name: "check_expansion" },
    },
    // Pivot Independent -> Expansion Confirmed Check
    {
      id: "e-pivot-indep-confirm",
      source: "expansion_pivot_independent",
      target: "expansion_confirmed_check",
      data: { kind: "transition", name: "check_expansion" },
    },
    // Expansion Confirmed -> Timeline Check (yes)
    {
      id: "e-expansion-yes-timeline",
      source: "expansion_confirmed_check",
      target: "timeline_check",
      data: {
        kind: "transition",
        name: "expansion_yes",
        conditions: "expansion_confirmed == true",
      },
    },
    // Expansion Confirmed -> Final Math Check (no expansion)
    {
      id: "e-expansion-no-final",
      source: "expansion_confirmed_check",
      target: "final_math_check",
      data: {
        kind: "transition",
        name: "no_expansion",
        conditions: "expansion_confirmed == false",
        prompt: "Proceed with current user count only. No expansion to count.",
      },
    },
    // Timeline Check -> Timeline Gate
    {
      id: "e-timeline-gate",
      source: "timeline_check",
      target: "timeline_gate",
      data: { kind: "transition", name: "parse_timeline" },
    },
    // Timeline Gate -> Ask Total Count (within 3 months)
    {
      id: "e-timeline-yes-total",
      source: "timeline_gate",
      target: "ask_total_count",
      data: {
        kind: "transition",
        name: "within_3_months",
        conditions: "within_3_months == true",
      },
    },
    // Timeline Gate -> Final Math Check (further out — don't count expansion)
    {
      id: "e-timeline-no-final",
      source: "timeline_gate",
      target: "final_math_check",
      data: {
        kind: "transition",
        name: "further_out",
        conditions: "within_3_months == false",
        prompt: "Expansion is too far out. Use current user count only.",
      },
    },
    // Ask Total Count -> Final Math Check
    {
      id: "e-total-count-final",
      source: "ask_total_count",
      target: "final_math_check",
      data: {
        kind: "transition",
        name: "total_provided",
        prompt: "Use the expanded total for qualification math.",
      },
    },
    // Final Math Check -> Qualified Handoff
    {
      id: "e-final-qualified",
      source: "final_math_check",
      target: "qualified_handoff",
      data: {
        kind: "transition",
        name: "qualified",
        conditions: "final_qualified == true",
      },
    },
    // Final Math Check -> Soft Letdown
    {
      id: "e-final-unqualified",
      source: "final_math_check",
      target: "exit_soft_letdown",
      data: {
        kind: "transition",
        name: "unqualified",
        conditions: "final_qualified == false",
      },
    },
    // Qualified Handoff -> Exit Enrichment
    {
      id: "e-handoff-enrichment",
      source: "qualified_handoff",
      target: "exit_enrichment",
      data: {
        kind: "transition",
        name: "transfer_to_enrichment",
      },
    },
  ],
};

export default sampleFlowModel;
