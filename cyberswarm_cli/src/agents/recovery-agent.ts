
// Recovery Agent - System restoration and integrity verification (Blue Team)
// Sub-agents: BackupRestorer (automated recovery), IntegrityVerifier (checksum/config checks)

import { BaseAgent } from './base-agent.js';
import { Task, CyberEvent, EventType } from '../types.js';
import { GeminiClient } from '../gemini/gemini-client.js';
import { PROMPTS } from '../gemini/prompts.js';
import { logger } from '../utils/logger.js';

export class RecoveryAgent extends BaseAgent {
  constructor(geminiClient: GeminiClient) {
    super(
      'recovery-01',
      'System Recovery Agent',
      'RecoveryAgent',
      ['restore_backup', 'verify_integrity', 'rollback_system', 'rebuild_service'],
      geminiClient
    );
  }

  async executeTask(task: Task): Promise<CyberEvent> {
    this.setStatus("BUSY");

    try {
      this.logChainOfThought(
        1,
        "analysis",
        "Analyzing recovery request",
        `Received ${task.taskName} task for ${task.target || 'target'}. Coordinating BackupRestorer and IntegrityVerifier sub-agents for system recovery.`,
        { taskName: task.taskName, target: task.target }
      );

      switch (task.taskName) {
        case 'restore_backup':
          return await this.restoreBackup(task);
        case 'verify_integrity':
          return await this.verifyIntegrity(task);
        case 'rollback_system':
          return await this.rollbackSystem(task);
        case 'rebuild_service':
          return await this.rebuildService(task);
        default:
          throw new Error(`Unsupported task: ${task.taskName}`);
      }
    } catch (error: any) {
      logger.error(`[${this.agentId}] Task execution failed: ${error.message}`);
      this.setStatus("ERROR");
      throw error;
    } finally {
      if (this.status !== "ERROR") {
        this.setStatus("IDLE");
      }
    }
  }

  /**
   * Sub-agent: BackupRestorer - Automated snapshot recovery
   */
  private async restoreBackup(task: Task): Promise<CyberEvent> {
    const target = task.target || '192.168.1.100';
    const context = task.details || {};

    this.logChainOfThought(
      2,
      "analysis",
      "[BackupRestorer] Backup restoration plan",
      `Sub-agent BackupRestorer identifying latest clean backup for ${target}. Validating backup integrity before restoration.`,
      { target, context, sub_agent: 'BackupRestorer' }
    );

    await this.delay(3000, 5000);

    const restoreResult = await this.getGeminiDecision<any>(
      PROMPTS.RECOVERY_RESTORE_BACKUP(target, context)
    );

    this.logChainOfThought(
      3,
      "evaluation",
      "[BackupRestorer] Restoration results",
      `Backup restoration ${restoreResult.success ? 'successful' : 'failed'}. Restored from: ${restoreResult.backup_point || 'latest'}. Systems restored: ${restoreResult.systems_restored?.length || 0}. Downtime: ${restoreResult.downtime_seconds || 0}s.`,
      {
        success: restoreResult.success,
        backup_point: restoreResult.backup_point,
        systems: restoreResult.systems_restored?.length,
        sub_agent: 'BackupRestorer',
      },
      restoreResult.confidence
    );

    const eventType = restoreResult.success !== false ? EventType.RECOVERY_COMPLETE : EventType.RECOVERY_FAILED;

    return this.emitEvent(
      eventType,
      {
        recovery_id: `recovery-backup-${Date.now()}`,
        target,
        action_type: 'backup_restore',
        sub_agent: 'BackupRestorer',
        success: restoreResult.success !== false,
        systems_restored: restoreResult.systems_restored || [],
        backup_point: restoreResult.backup_point,
        integrity_checks: [],
        downtime_seconds: restoreResult.downtime_seconds || 0,
      },
      restoreResult.success !== false ? 'Medium' : 'High',
      target,
      task.taskId
    );
  }

  /**
   * Sub-agent: IntegrityVerifier - Checksum and configuration validation
   */
  private async verifyIntegrity(task: Task): Promise<CyberEvent> {
    const target = task.target || '192.168.1.100';
    const context = task.details || {};

    this.logChainOfThought(
      2,
      "analysis",
      "[IntegrityVerifier] Integrity verification",
      `Sub-agent IntegrityVerifier performing checksums and configuration validation on ${target}. Comparing against known-good baselines.`,
      { target, context, sub_agent: 'IntegrityVerifier' }
    );

    await this.delay(3000, 5500);

    const verifyResult = await this.getGeminiDecision<any>(
      PROMPTS.RECOVERY_VERIFY_INTEGRITY(target, context)
    );

    this.logChainOfThought(
      3,
      "evaluation",
      "[IntegrityVerifier] Integrity check results",
      `Verified ${verifyResult.components_checked || 0} components. ${verifyResult.passed || 0} passed, ${verifyResult.failed || 0} failed, ${verifyResult.warnings || 0} warnings.`,
      {
        checked: verifyResult.components_checked,
        passed: verifyResult.passed,
        failed: verifyResult.failed,
        warnings: verifyResult.warnings,
        sub_agent: 'IntegrityVerifier',
      },
      verifyResult.confidence
    );

    const allPassed = (verifyResult.failed || 0) === 0;
    const eventType = allPassed ? EventType.RECOVERY_COMPLETE : EventType.RECOVERY_FAILED;

    return this.emitEvent(
      eventType,
      {
        recovery_id: `recovery-verify-${Date.now()}`,
        target,
        action_type: 'integrity_verify',
        sub_agent: 'IntegrityVerifier',
        success: allPassed,
        systems_restored: [],
        integrity_checks: verifyResult.checks || [],
        components_checked: verifyResult.components_checked || 0,
        passed: verifyResult.passed || 0,
        failed: verifyResult.failed || 0,
        warnings: verifyResult.warnings || 0,
        downtime_seconds: 0,
      },
      allPassed ? 'Low' : 'High',
      target,
      task.taskId
    );
  }

  /**
   * Sub-agent: BackupRestorer - Full system rollback
   */
  private async rollbackSystem(task: Task): Promise<CyberEvent> {
    const target = task.target || '192.168.1.100';
    const context = task.details || {};

    this.logChainOfThought(
      2,
      "analysis",
      "[BackupRestorer] System rollback",
      `Sub-agent BackupRestorer executing full system rollback on ${target} to pre-incident state. Rolling back to snapshot: ${context.rollback_point || 'last_known_good'}.`,
      { target, context, sub_agent: 'BackupRestorer' }
    );

    await this.delay(4000, 7000);

    const rollbackResult = await this.getGeminiDecision<any>(
      PROMPTS.RECOVERY_ROLLBACK(target, context)
    );

    this.logChainOfThought(
      3,
      "evaluation",
      "[BackupRestorer] Rollback results",
      `Rollback ${rollbackResult.success ? 'successful' : 'failed'}. Systems rolled back: ${rollbackResult.systems_restored?.length || 0}. Data loss window: ${rollbackResult.data_loss_window || 'none'}.`,
      {
        success: rollbackResult.success,
        systems: rollbackResult.systems_restored?.length,
        data_loss: rollbackResult.data_loss_window,
        sub_agent: 'BackupRestorer',
      },
      rollbackResult.confidence
    );

    return this.emitEvent(
      rollbackResult.success !== false ? EventType.RECOVERY_COMPLETE : EventType.RECOVERY_FAILED,
      {
        recovery_id: `recovery-rollback-${Date.now()}`,
        target,
        action_type: 'rollback',
        sub_agent: 'BackupRestorer',
        success: rollbackResult.success !== false,
        systems_restored: rollbackResult.systems_restored || [],
        rollback_point: rollbackResult.rollback_point || context.rollback_point,
        integrity_checks: [],
        data_loss_window: rollbackResult.data_loss_window,
        downtime_seconds: rollbackResult.downtime_seconds || 0,
      },
      rollbackResult.success !== false ? 'Medium' : 'Critical',
      target,
      task.taskId
    );
  }

  /**
   * Combined: Rebuild compromised service from clean state
   */
  private async rebuildService(task: Task): Promise<CyberEvent> {
    const target = task.target || '192.168.1.100';
    const context = task.details || {};

    this.logChainOfThought(
      2,
      "analysis",
      "[BackupRestorer+IntegrityVerifier] Service rebuild",
      `Both sub-agents coordinating to rebuild service on ${target}. BackupRestorer deploys clean image, IntegrityVerifier validates deployment.`,
      { target, context, sub_agents: ['BackupRestorer', 'IntegrityVerifier'] }
    );

    await this.delay(5000, 9000);

    const rebuildResult = await this.getGeminiDecision<any>(
      PROMPTS.RECOVERY_REBUILD(target, context)
    );

    this.logChainOfThought(
      3,
      "evaluation",
      "Service rebuild results",
      `Service rebuild ${rebuildResult.success ? 'complete' : 'failed'}. Services restored: ${rebuildResult.services_rebuilt?.length || 0}. Integrity verified: ${rebuildResult.integrity_verified || false}.`,
      {
        success: rebuildResult.success,
        services: rebuildResult.services_rebuilt?.length,
        verified: rebuildResult.integrity_verified,
      },
      rebuildResult.confidence
    );

    return this.emitEvent(
      rebuildResult.success !== false ? EventType.RECOVERY_COMPLETE : EventType.RECOVERY_FAILED,
      {
        recovery_id: `recovery-rebuild-${Date.now()}`,
        target,
        action_type: 'rebuild',
        sub_agent: 'BackupRestorer',
        success: rebuildResult.success !== false,
        systems_restored: rebuildResult.services_rebuilt || [],
        integrity_checks: rebuildResult.integrity_checks || [],
        integrity_verified: rebuildResult.integrity_verified,
        downtime_seconds: rebuildResult.downtime_seconds || 0,
      },
      rebuildResult.success !== false ? 'Medium' : 'Critical',
      target,
      task.taskId
    );
  }
}
