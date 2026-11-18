import { Controller, Post, Body, Param, Request } from '@nestjs/common';
import { ReviewsService } from './reviews.service';

@Controller('amendments/:id/review')
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  @Post()
  async submitReview(
    @Param('id') amendmentId: string,
    @Body() body: any,
    @Request() req: any
  ) {
    const reviewerId = req.user?.id || 'demo-reviewer-id';
    return this.reviewsService.submitReview(amendmentId, reviewerId, body);
  }
}

