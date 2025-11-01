// Strategy Adaptation Agent - Adaptive red team strategy with Gemini AI
import { BaseAgent } from './base-agent.js';
import { EventType } from '../types.js';
import { PROMPTS } from '../gemini/prompts.js';
import { logger } from '../utils/logger.js';
export class StrategyAdaptationAgent extends BaseAgent {
    constructor(geminiClient) {
        super('strategy-adapt-01', 'Strategy Adaptation Agent', 'StrategyAdaptationAgent', ['adapt_strategy', 'reevaluate_targets', 'change_tactics'], geminiClient);
    }
    async executeTask(task) {
        this.setStatus("BUSY");
        try {
            this.logChainOfThought(1, "analysis", "Analyzing strategy adaptation request", `Received ${task.taskName} task. Using Gemini AI for intelligent tactical decision-making.`, { taskName: task.taskName });
            switch (task.taskName) {
                case 'adapt_strategy':
                    return await this.adaptStrategy(task);
                case 'reevaluate_targets':
                    return await this.reevaluateTargets(task);
                case 'change_tactics':
                    return await this.changeTactics(task);
                default:
                    throw new Error(`Unsupported task: ${task.taskName}`);
            }
        }
        catch (error) {
            logger.error(`[${this.agentId}] Task execution failed: ${error.message}`);
            this.setStatus("ERROR");
            throw error;
        }
        finally {
            if (this.status !== "ERROR") {
                this.setStatus("IDLE");
            }
        }
    }
    async adaptStrategy(task) {
        const context = task.details || {};
        this.logChainOfThought(2, "analysis", "Situation analysis", `Analyzing current operational context to determine if strategy adaptation is needed`, { context });
        await this.delay(1500, 3000);
        // Use Gemini for strategic analysis
        const adaptation = await this.getGeminiDecision(PROMPTS.STRATEGY_ADAPTATION(context));
        this.logChainOfThought(3, "decision", "Strategy adaptation decision", adaptation.reasoning, {
            adaptation_needed: adaptation.adaptation_needed,
            new_approach: adaptation.new_strategy.approach,
        }, adaptation.confidence);
        if (adaptation.adaptation_needed) {
            this.logChainOfThought(4, "action", "Implementing new strategy", `Adapting tactics: ${adaptation.new_strategy.tactics.join(', ')}`, {
                tactics: adaptation.new_strategy.tactics,
                stealth_level: adaptation.new_strategy.stealth_level,
            }, adaptation.confidence);
            await this.delay(2000, 4000);
            const attackAdaptation = {
                strategy_change: adaptation.new_strategy.approach,
                reason: adaptation.reasoning,
                new_techniques: adaptation.new_strategy.techniques,
                adaptation_type: 'strategic_pivot',
                confidence: adaptation.confidence,
            };
            return this.emitEvent(EventType.ATTACK_ADAPTATION, {
                ...attackAdaptation,
                full_analysis: adaptation,
            }, 'High', undefined, task.taskId);
        }
        // No adaptation needed
        return this.emitEvent(EventType.ATTACK_ADAPTATION, {
            strategy_change: 'maintain_current',
            reason: adaptation.reasoning,
            new_techniques: [],
            adaptation_type: 'no_change',
            confidence: adaptation.confidence,
        }, 'Low', undefined, task.taskId);
    }
    async reevaluateTargets(task) {
        const context = task.details || {};
        this.logChainOfThought(2, "analysis", "Target reevaluation", `Reevaluating targets based on current situation and defensive responses`, { context });
        await this.delay(1500, 3000);
        // Use Gemini for target analysis
        const analysis = await this.getGeminiDecision(PROMPTS.STRATEGY_ADAPTATION({
            ...context,
            task: 'reevaluate_targets',
        }));
        this.logChainOfThought(3, "decision", "Target prioritization", `Identified ${analysis.alternative_targets?.length || 0} alternative targets`, { targets: analysis.alternative_targets }, analysis.confidence);
        const attackAdaptation = {
            strategy_change: 'target_shift',
            reason: 'Reevaluating targets based on defensive measures',
            new_techniques: analysis.evasion_techniques?.map((t) => t.technique) || [],
            adaptation_type: 'target_reevaluation',
            confidence: analysis.confidence,
        };
        return this.emitEvent(EventType.TARGET_REEVALUATION, {
            ...attackAdaptation,
            alternative_targets: analysis.alternative_targets,
        }, 'Medium', undefined, task.taskId);
    }
    async changeTactics(task) {
        const context = task.details || {};
        this.logChainOfThought(2, "analysis", "Tactical changes", `Determining tactical adjustments to evade detection and improve effectiveness`, { context });
        await this.delay(1500, 3000);
        // Use Gemini for tactical recommendations
        const tactics = await this.getGeminiDecision(PROMPTS.STRATEGY_ADAPTATION({
            ...context,
            task: 'change_tactics',
        }));
        this.logChainOfThought(3, "decision", "Tactical recommendations", `Recommended ${tactics.new_strategy?.tactics?.length || 0} tactical changes`, { tactics: tactics.new_strategy }, tactics.confidence);
        const attackAdaptation = {
            strategy_change: 'tactical_adjustment',
            reason: 'Adapting tactics to improve operational effectiveness',
            new_techniques: tactics.new_strategy?.techniques || [],
            adaptation_type: 'tactical_change',
            confidence: tactics.confidence,
        };
        return this.emitEvent(EventType.ATTACK_ADAPTATION, {
            ...attackAdaptation,
            tactics: tactics.new_strategy,
            evasion: tactics.evasion_techniques,
        }, 'Medium', undefined, task.taskId);
    }
}
//# sourceMappingURL=strategy-adaptation-agent.js.map