// API route to test AI integration
import { NextRequest, NextResponse } from "next/server";
import {
	getProviderStatus,
	testConnection,
	analyzeWardrobe,
	describeOutfit,
	getColorRecommendations,
} from "@/lib/ai";
import type { ClothingItem } from "@/types";

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const action = searchParams.get("action") || "status";

		switch (action) {
			case "status":
				const status = getProviderStatus();
				return NextResponse.json({
					success: true,
					data: status,
				});

			case "test":
				const testResult = await testConnection();
				return NextResponse.json({
					success: testResult.success,
					data: testResult,
					message: testResult.success
						? "AI connection successful"
						: `AI connection failed: ${testResult.error}`,
				});

			case "analyze":
				// Test style analysis with sample data
				const sampleItems: ClothingItem[] = [
					{
						id: "test-1",
						user_id: "test-user",
						name: "Black T-Shirt",
						category: "tops",
						colors: ["#000000", "#FFFFFF"],
						image_url: "test-url",
						image_path: "test-path",
						occasions: ["casual", "work"],
						seasons: ["all_season"],
						mood_tags: ["classic", "professional"],
						wear_count: 0,
						favorite: false,
						created_at: new Date().toISOString(),
						updated_at: new Date().toISOString(),
					},
					{
						id: "test-2",
						user_id: "test-user",
						name: "Navy Pants",
						category: "bottoms",
						colors: ["#000080"],
						image_url: "test-url",
						image_path: "test-path",
						occasions: ["casual", "work"],
						seasons: ["all_season"],
						mood_tags: ["classic"],
						wear_count: 0,
						favorite: false,
						created_at: new Date().toISOString(),
						updated_at: new Date().toISOString(),
					},
				];

				const analysisResult = await analyzeWardrobe(sampleItems);
				return NextResponse.json({
					success: true,
					data: analysisResult,
				});

			case "describe":
				// Test outfit description with sample data
				const sampleOutfit: ClothingItem[] = [
					{
						id: "test-3",
						user_id: "test-user",
						name: "Black Blazer",
						category: "outerwear",
						colors: ["#000000"],
						image_url: "test-url",
						image_path: "test-path",
						occasions: ["work"],
						seasons: ["all_season"],
						mood_tags: ["professional"],
						wear_count: 0,
						favorite: false,
						created_at: new Date().toISOString(),
						updated_at: new Date().toISOString(),
					},
					{
						id: "test-4",
						user_id: "test-user",
						name: "White Shirt",
						category: "tops",
						colors: ["#FFFFFF"],
						image_url: "test-url",
						image_path: "test-path",
						occasions: ["work"],
						seasons: ["all_season"],
						mood_tags: ["professional"],
						wear_count: 0,
						favorite: false,
						created_at: new Date().toISOString(),
						updated_at: new Date().toISOString(),
					},
					{
						id: "test-5",
						user_id: "test-user",
						name: "Navy Trousers",
						category: "bottoms",
						colors: ["#000080"],
						image_url: "test-url",
						image_path: "test-path",
						occasions: ["work"],
						seasons: ["all_season"],
						mood_tags: ["professional"],
						wear_count: 0,
						favorite: false,
						created_at: new Date().toISOString(),
						updated_at: new Date().toISOString(),
					},
				];

				const descriptionResult = await describeOutfit(sampleOutfit, {
					occasion: "work",
					season: "fall",
					mood: "professional",
				});

				return NextResponse.json({
					success: true,
					data: descriptionResult,
				});

			case "colors":
				// Test color recommendations
				const baseColors = ["#000000", "#FFFFFF"];
				const colorResult = await getColorRecommendations(baseColors);

				return NextResponse.json({
					success: true,
					data: {
						baseColors,
						recommendations: colorResult,
					},
				});

			case "connection":
				// Test AI provider connection
				const connectionResult = await testConnection();

				return NextResponse.json({
					success: true,
					data: connectionResult,
				});

			default:
				return NextResponse.json(
					{
						success: false,
						error:
							"Invalid action. Use: status, analyze, describe, colors, or connection",
					},
					{ status: 400 }
				);
		}
	} catch (error) {
		console.error("AI test API error:", error);
		return NextResponse.json(
			{
				success: false,
				error:
					error instanceof Error ? error.message : "Unknown error occurred",
			},
			{ status: 500 }
		);
	}
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { action, data } = body;

		switch (action) {
			case "analyze_wardrobe":
				if (!data?.items || !Array.isArray(data.items)) {
					return NextResponse.json(
						{
							success: false,
							error: "Items array is required",
						},
						{ status: 400 }
					);
				}

				const result = await analyzeWardrobe(data.items);
				return NextResponse.json(result);

			case "describe_outfit":
				if (!data?.items || !Array.isArray(data.items)) {
					return NextResponse.json(
						{
							success: false,
							error: "Items array is required",
						},
						{ status: 400 }
					);
				}

				const descResult = await describeOutfit(data.items, data.context);
				return NextResponse.json(descResult);

			case "color_recommendations":
				if (!data?.colors || !Array.isArray(data.colors)) {
					return NextResponse.json(
						{
							success: false,
							error: "Colors array is required",
						},
						{ status: 400 }
					);
				}

				const colorRecs = await getColorRecommendations(
					data.colors,
					data.occasion
				);
				return NextResponse.json(colorRecs);

			default:
				return NextResponse.json(
					{
						success: false,
						error: "Invalid action",
					},
					{ status: 400 }
				);
		}
	} catch (error) {
		console.error("AI test API POST error:", error);
		return NextResponse.json(
			{
				success: false,
				error:
					error instanceof Error ? error.message : "Unknown error occurred",
			},
			{ status: 500 }
		);
	}
}
