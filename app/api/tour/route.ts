/**
 * @file app/api/tour/route.ts
 * @description 한국관광공사 API 프록시 라우트
 *
 * CORS 문제를 해결하기 위해 서버 사이드에서 API를 호출하는 프록시 역할을 합니다.
 * 클라이언트 컴포넌트는 이 API Route를 통해 한국관광공사 API에 접근합니다.
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getAreaCodes,
  getAreaBasedList,
  searchKeyword,
  getDetailCommon,
  getDetailIntro,
  getDetailImage,
} from '@/lib/api/tour-api';

/**
 * GET /api/tour - 관광지 API 프록시
 *
 * Query Parameters:
 * - action: 'areaCodes' | 'areaBasedList' | 'searchKeyword'
 * - 기타 파라미터는 각 액션에 맞게 전달
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action');

    if (!action) {
      return NextResponse.json(
        { error: 'action 파라미터가 필요합니다.' },
        { status: 400 }
      );
    }

    console.log('[Tour API Route] 요청:', action, searchParams.toString());

    switch (action) {
      case 'areaCodes': {
        const numOfRows = searchParams.get('numOfRows')
          ? parseInt(searchParams.get('numOfRows')!)
          : undefined;
        const pageNo = searchParams.get('pageNo')
          ? parseInt(searchParams.get('pageNo')!)
          : undefined;

        const result = await getAreaCodes({ numOfRows, pageNo });
        return NextResponse.json({ success: true, data: result });
      }

      case 'areaBasedList': {
        const areaCode = searchParams.get('areaCode') || undefined;
        const sigunguCode = searchParams.get('sigunguCode') || undefined;
        const contentTypeId = searchParams.get('contentTypeId') || undefined;
        const arrange = searchParams.get('arrange') || 'O';
        const numOfRows = searchParams.get('numOfRows')
          ? parseInt(searchParams.get('numOfRows')!)
          : 20;
        const pageNo = searchParams.get('pageNo')
          ? parseInt(searchParams.get('pageNo')!)
          : 1;

        console.log('[Tour API Route] areaBasedList 파라미터:', {
          areaCode,
          contentTypeId,
          arrange,
          numOfRows,
          pageNo,
        });

        const result = await getAreaBasedList({
          areaCode,
          sigunguCode,
          contentTypeId: contentTypeId as any,
          arrange: arrange as any,
          numOfRows,
          pageNo,
        });

        console.log('[Tour API Route] areaBasedList 결과:', {
          itemCount: result.items.length,
          totalCount: result.totalCount,
        });

        return NextResponse.json({ success: true, data: result });
      }

      case 'searchKeyword': {
        const keyword = searchParams.get('keyword');
        if (!keyword) {
          return NextResponse.json(
            { error: 'keyword 파라미터가 필요합니다.' },
            { status: 400 }
          );
        }

        const areaCode = searchParams.get('areaCode') || undefined;
        const contentTypeId = searchParams.get('contentTypeId') || undefined;
        const numOfRows = searchParams.get('numOfRows')
          ? parseInt(searchParams.get('numOfRows')!)
          : 20;
        const pageNo = searchParams.get('pageNo')
          ? parseInt(searchParams.get('pageNo')!)
          : 1;

        console.log('[Tour API Route] searchKeyword 파라미터:', {
          keyword,
          areaCode,
          contentTypeId,
          numOfRows,
          pageNo,
        });

        const result = await searchKeyword({
          keyword,
          areaCode,
          contentTypeId: contentTypeId as any,
          numOfRows,
          pageNo,
        });

        console.log('[Tour API Route] searchKeyword 결과:', {
          itemCount: result.items.length,
          totalCount: result.totalCount,
          firstItem: result.items[0] ? {
            title: result.items[0].title,
            contentid: result.items[0].contentid,
          } : null,
        });

        return NextResponse.json({ success: true, data: result });
      }

      case 'detailCommon': {
        const contentId = searchParams.get('contentId');
        if (!contentId) {
          return NextResponse.json(
            { error: 'contentId 파라미터가 필요합니다.' },
            { status: 400 }
          );
        }

        console.log('[Tour API Route] detailCommon 파라미터:', { contentId });

        const result = await getDetailCommon(contentId);

        console.log('[Tour API Route] detailCommon 결과:', {
          title: result.title,
          contentId: result.contentid,
        });

        return NextResponse.json({ success: true, data: result });
      }

      case 'detailIntro': {
        const contentId = searchParams.get('contentId');
        const contentTypeId = searchParams.get('contentTypeId');
        if (!contentId || !contentTypeId) {
          return NextResponse.json(
            { error: 'contentId와 contentTypeId 파라미터가 필요합니다.' },
            { status: 400 }
          );
        }

        console.log('[Tour API Route] detailIntro 파라미터:', {
          contentId,
          contentTypeId,
        });

        const result = await getDetailIntro(contentId, contentTypeId as any);

        console.log('[Tour API Route] detailIntro 결과:', {
          contentId: result.contentid,
          hasInfo: !!(result.usetime || result.restdate || result.usefee),
        });

        return NextResponse.json({ success: true, data: result });
      }

      case 'detailImage': {
        const contentId = searchParams.get('contentId');
        if (!contentId) {
          return NextResponse.json(
            { error: 'contentId 파라미터가 필요합니다.' },
            { status: 400 }
          );
        }

        console.log('[Tour API Route] detailImage 파라미터:', { contentId });

        const result = await getDetailImage(contentId);

        console.log('[Tour API Route] detailImage 결과:', {
          imageCount: result.length,
        });

        return NextResponse.json({ success: true, data: result });
      }

      default:
        return NextResponse.json(
          { error: `알 수 없는 action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('[Tour API Route] 에러:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : '알 수 없는 오류',
      },
      { status: 500 }
    );
  }
}

