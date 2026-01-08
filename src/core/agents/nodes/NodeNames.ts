type LanggraphNodes =  'DOMAIN_OBTAINER' |
                       'QW_BROWSER_TEST' | 
                       'QW_BROWSER_RECOGNITION_TEST' |
                       'FINAL_OUTPUT' |
                       'OBJECTIVE_ASSIGNER' |
                       'OBJECTIVE_ACHIEVER' |
                       'AGENT_REVIEWER' |
                       'STRATEGY_FORMULATOR' |
                       'QUESTION_FORMULATOR' |
                       'HUMAN_SKIP_INTERRUPT_STRATEGY' |
                       'HUMAN_SKIP_INTERRUPT_QUESTION' |
                       'ASK_ASSISTANT_CONTEXT' |
                       'TOOLS' |
                       'OUTPUT_PREPARER' |
                       'INITIAL_ROUTER';

type LanggraphNodeNames = {
    [key in LanggraphNodes]: string;
};

export const LanggraphNode: LanggraphNodeNames = {
    DOMAIN_OBTAINER: "domain_obtainer",
    QW_BROWSER_TEST: "qw_browser_test",
    QW_BROWSER_RECOGNITION_TEST: "qw_browser_recognition_test",
    FINAL_OUTPUT: "final_output",
    OBJECTIVE_ASSIGNER: "objective_assigner",
    OBJECTIVE_ACHIEVER: "objective_achiever",
    AGENT_REVIEWER: "agent_reviewer",
    STRATEGY_FORMULATOR: "strategy_formulator",
    QUESTION_FORMULATOR: "question_formulator",
    HUMAN_SKIP_INTERRUPT_STRATEGY: "human_skip_interrupt_strategy",
    HUMAN_SKIP_INTERRUPT_QUESTION: "human_skip_interrupt_question",
    ASK_ASSISTANT_CONTEXT: "ask_assistant_context",
    TOOLS: "tools",
    OUTPUT_PREPARER: "output_preparer",
    INITIAL_ROUTER: "initial_router",
};