import { progressService } from './progressService';
import { RewardState } from './types';

export class RewardService {
  public async getRewards(): Promise<RewardState> {
    return await progressService.getRewardState();
  }

  public getCircusStageDetails(stageLevel: number): {
    title: string;
    description: string;
    decorations: string[];
  } {
    const stages = [
      {
        title: 'Carpa Base del Circo',
        description: 'La carpa roja y blanca recién montada en la pradera.',
        decorations: ['🎪 Carpa clásica'],
      },
      {
        title: 'Circo con Banderines Coloridos',
        description: 'Banderines y guirnaldas ondeando alegremente al viento.',
        decorations: ['🎪 Carpa clásica', '🎏 Banderines multicolores'],
      },
      {
        title: 'Circo Iluminado con Guirnaldas de Luces',
        description: 'Faroles mágicos y destellos dorados brillando en el atardecer.',
        decorations: ['🎪 Carpa clásica', '🎏 Banderines', '💡 Luces festivas'],
      },
      {
        title: 'Circo con Gradas y Público Familiar',
        description: 'Los animalitos de la selva y las familias aplauden con entusiasmo.',
        decorations: ['🎪 Carpa clásica', '🎏 Banderines', '💡 Luces festivas', '👥 Público alegre'],
      },
      {
        title: '¡Gran Circo Estelar de Ximenita!',
        description: 'Fuegos artificiales, pista dorada y ovación completa.',
        decorations: ['🎪 Carpa clásica', '🎏 Banderines', '💡 Luces festivas', '👥 Público alegre', '🎆 Fuegos artificiales'],
      },
    ];
    return stages[Math.min(5, Math.max(1, stageLevel)) - 1];
  }
}

export const rewardService = new RewardService();
