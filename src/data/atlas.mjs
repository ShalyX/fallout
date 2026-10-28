export const atlasGraph = {
  workspace: 'Atlas Onboarding',
  fixtureLabel: 'Synthetic demo corpus',
  nodes: [
    {
      id: 'E17', type: 'evidence', label: 'Experiment E-17',
      summary: 'Simplified onboarding increased completed activation by 11.0% relative.',
      x: 10, y: 24,
      source: { file: 'experiment_e17.md', section: 'Results', excerpt: 'The simplified onboarding variant increased completed activation from 38.2% to 42.4%, an 11.0% relative lift.' }
    },
    {
      id: 'E19', type: 'evidence', label: 'Interview Study E-19',
      summary: 'New users repeatedly described the old setup as front-loaded and confusing.',
      x: 10, y: 58,
      source: { file: 'interview_study_e19.md', section: 'Synthesis', excerpt: 'Nine of twelve participants described the old setup as front-loaded. Seven explicitly asked to finish profile details after reaching the product.' }
    },
    {
      id: 'C1', type: 'claim', label: 'Simplified onboarding improves activation',
      summary: 'The new flow materially improves completed activation.',
      x: 43, y: 24,
      source: { file: 'activation_claim.md', section: 'Claim', excerpt: 'We believe the simplified flow materially improves completed activation, based primarily on Experiment E-17.' }
    },
    {
      id: 'C2', type: 'claim', label: 'Front-loaded setup creates avoidable friction',
      summary: 'Deferring nonessential profile steps reduces perceived setup burden.',
      x: 43, y: 58,
      source: { file: 'friction_claim.md', section: 'Claim', excerpt: 'User research indicates that deferring nonessential profile questions reduces perceived setup burden and confusion.' }
    },
    {
      id: 'D1', type: 'decision', label: 'Global rollout',
      summary: 'Ship simplified onboarding to 100% of new users.',
      x: 77, y: 12,
      source: { file: 'rollout_decision.md', section: 'Rationale', excerpt: 'The decision is justified by the activation lift observed in E-17. The experiment is considered sufficient evidence for worldwide launch; no additional quantitative validation is required before rollout.' }
    },
    {
      id: 'D2', type: 'decision', label: 'Q4 onboarding roadmap',
      summary: 'Prioritize onboarding work over referral-loop work this quarter.',
      x: 77, y: 34,
      source: { file: 'q4_roadmap.md', section: 'Priority rationale', excerpt: 'Onboarding remains the Q4 priority because E-17 shows measurable activation upside and E-19 shows persistent setup friction.' }
    },
    {
      id: 'A1', type: 'artifact', label: 'Sales deck claim',
      summary: 'Position Atlas as delivering faster time-to-value for new teams.',
      x: 77, y: 57,
      source: { file: 'sales_messaging.md', section: 'Approved message', excerpt: 'Atlas gets new teams to value faster: our simplified onboarding improves activation while reducing setup friction.' }
    },
    {
      id: 'D3', type: 'decision', label: 'Progressive profile setup',
      summary: 'Keep optional profile completion after first value moment.',
      x: 77, y: 80,
      source: { file: 'profile_setup_decision.md', section: 'Rationale', excerpt: "The strongest rationale is the repeated qualitative evidence that users resent front-loaded setup. E-17's activation result was considered a secondary benefit, not the reason this interaction pattern should remain." }
    }
  ],
  edges: [
    { id:'E17-C1', from:'E17', to:'C1', relation:'supports', weight:0.98, verified:true, basis:'primary', sourceSpan:'increased completed activation from 38.2% to 42.4%', targetSpan:'based primarily on Experiment E-17', counterfactual:'If E-17 is invalid, the activation-improvement claim loses its only direct quantitative support.' },
    { id:'E19-C2', from:'E19', to:'C2', relation:'supports', weight:0.90, verified:true, basis:'primary', sourceSpan:'described the old setup as front-loaded', targetSpan:'deferring nonessential profile questions reduces perceived setup burden', counterfactual:'If E-19 is invalid, the friction claim loses its main direct user-research support.' },
    { id:'C1-D1', from:'C1', to:'D1', relation:'supports', weight:0.95, verified:true, basis:'primary', sourceSpan:'materially improves completed activation', targetSpan:'justified by the activation lift observed in E-17', counterfactual:'Without the activation claim, the rollout memo has no independent quantitative rationale.' },
    { id:'C1-D2', from:'C1', to:'D2', relation:'supports', weight:0.72, verified:true, basis:'material', sourceSpan:'materially improves completed activation', targetSpan:'E-17 shows measurable activation upside', counterfactual:'Removing the activation claim weakens the roadmap priority, but the user-friction rationale remains.' },
    { id:'C2-D2', from:'C2', to:'D2', relation:'supports', weight:0.66, verified:true, basis:'material', sourceSpan:'reduces perceived setup burden and confusion', targetSpan:'E-19 shows persistent setup friction', counterfactual:'This independent qualitative rationale survives even if the activation evidence fails.' },
    { id:'C1-A1', from:'C1', to:'A1', relation:'supports', weight:0.68, verified:true, basis:'material', sourceSpan:'materially improves completed activation', targetSpan:'simplified onboarding improves activation', counterfactual:'The performance half of the sales claim becomes unsupported if the activation evidence fails.' },
    { id:'C2-A1', from:'C2', to:'A1', relation:'supports', weight:0.52, verified:true, basis:'secondary', sourceSpan:'reduces perceived setup burden', targetSpan:'while reducing setup friction', counterfactual:'The friction half of the message remains supported independently.' },
    { id:'C1-D3', from:'C1', to:'D3', relation:'supports', weight:0.30, verified:true, basis:'secondary', sourceSpan:'improves completed activation', targetSpan:'after the first value moment', counterfactual:'Losing E-17 weakens a secondary rationale only.' },
    { id:'C2-D3', from:'C2', to:'D3', relation:'supports', weight:0.88, verified:true, basis:'primary', sourceSpan:'deferring nonessential profile questions reduces perceived setup burden', targetSpan:'The strongest rationale is the repeated qualitative evidence', counterfactual:'The primary qualitative rationale remains intact even if E-17 fails.' }
  ]
};

export const defaultInvalidation = {
  sourceId: 'E17',
  reason: 'Android instrumentation bug — approximately 30% of activation events were missing.'
};
