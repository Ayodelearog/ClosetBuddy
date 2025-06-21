"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface TestResult {
	success: boolean;
	data?: Record<string, unknown>;
	error?: string;
	message?: string;
}

export default function AITestPage() {
	const [results, setResults] = useState<Record<string, TestResult>>({});
	const [loading, setLoading] = useState<Record<string, boolean>>({});

	const runTest = async (testName: string, action: string) => {
		setLoading((prev) => ({ ...prev, [testName]: true }));

		try {
			const response = await fetch(`/api/ai/test?action=${action}`);
			const result = await response.json();
			setResults((prev) => ({ ...prev, [testName]: result }));
		} catch (error) {
			setResults((prev) => ({
				...prev,
				[testName]: {
					success: false,
					error: error instanceof Error ? error.message : "Unknown error",
				},
			}));
		} finally {
			setLoading((prev) => ({ ...prev, [testName]: false }));
		}
	};

	const tests = [
		{
			name: "AI Status",
			action: "status",
			description: "Check AI service configuration and availability",
		},
		{
			name: "Connection Test",
			action: "test",
			description: "Test connection to AI service",
		},
		{
			name: "Style Analysis",
			action: "analyze",
			description: "Test AI style analysis with sample wardrobe",
		},
		{
			name: "Outfit Description",
			action: "describe",
			description: "Test AI outfit description generation",
		},
		{
			name: "Color Recommendations",
			action: "colors",
			description: "Test AI color recommendation system",
		},
	];

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="max-w-4xl mx-auto">
				<h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-gray-100">
					AI Integration Test
				</h1>

				<div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
					<h2 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">
						About AI Integration
					</h2>
					<p className="text-gray-700 dark:text-gray-300">
						ClosetBuddy now supports multiple AI providers for enhanced outfit
						suggestions:
					</p>
					<ul className="list-disc list-inside mt-2 text-gray-700 dark:text-gray-300">
						<li>
							<strong className="text-gray-900 dark:text-gray-100">
								Hugging Face
							</strong>{" "}
							- Free tier with generous limits (default)
						</li>
						<li>
							<strong className="text-gray-900 dark:text-gray-100">
								OpenAI
							</strong>{" "}
							- Most advanced, requires API key
						</li>
						<li>
							<strong className="text-gray-900 dark:text-gray-100">
								Anthropic
							</strong>{" "}
							- High quality, requires API key
						</li>
						<li>
							<strong className="text-gray-900 dark:text-gray-100">
								Ollama
							</strong>{" "}
							- Local AI, completely free and private
						</li>
					</ul>
				</div>

				<div className="grid gap-6">
					{tests.map((test) => (
						<div
							key={test.name}
							className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-white dark:bg-gray-800">
							<div className="flex items-center justify-between mb-4">
								<div>
									<h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
										{test.name}
									</h3>
									<p className="text-gray-600 dark:text-gray-400">
										{test.description}
									</p>
								</div>
								<Button
									onClick={() => runTest(test.name, test.action)}
									disabled={loading[test.name]}
									className="min-w-[100px]">
									{loading[test.name] ? "Testing..." : "Run Test"}
								</Button>
							</div>

							{results[test.name] && (
								<div className="mt-4">
									<div
										className={`p-4 rounded-lg ${
											results[test.name].success
												? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
												: "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
										}`}>
										<div className="flex items-center mb-2">
											<span
												className={`inline-block w-3 h-3 rounded-full mr-2 ${
													results[test.name].success
														? "bg-green-500"
														: "bg-red-500"
												}`}></span>
											<span className="font-medium text-gray-900 dark:text-gray-100">
												{results[test.name].success ? "Success" : "Failed"}
											</span>
										</div>

										{results[test.name].message && (
											<p className="text-sm mb-2 text-gray-700 dark:text-gray-300">
												{results[test.name].message}
											</p>
										)}

										{results[test.name].error && (
											<p className="text-sm text-red-600 dark:text-red-400 mb-2">
												Error: {results[test.name].error}
											</p>
										)}

										{results[test.name].data && (
											<details className="mt-2">
												<summary className="cursor-pointer text-sm font-medium text-gray-900 dark:text-gray-100 hover:text-purple-600 dark:hover:text-purple-400">
													View Details
												</summary>
												<pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-700 rounded text-xs overflow-auto text-gray-800 dark:text-gray-200">
													{JSON.stringify(results[test.name].data, null, 2)}
												</pre>
											</details>
										)}
									</div>
								</div>
							)}
						</div>
					))}
				</div>

				<div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
					<h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">
						Setup Instructions
					</h3>
					<div className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
						<p>
							<strong className="text-gray-900 dark:text-gray-100">
								For Hugging Face (Free):
							</strong>
						</p>
						<ol className="list-decimal list-inside ml-4 space-y-1">
							<li>No API key required for public models</li>
							<li>
								Set{" "}
								<code className="bg-gray-200 dark:bg-gray-700 px-1 rounded text-gray-800 dark:text-gray-200">
									AI_SERVICE_PROVIDER=huggingface
								</code>{" "}
								in your .env.local
							</li>
							<li>
								Optional: Get API key from huggingface.co for higher rate limits
							</li>
						</ol>

						<p className="mt-4">
							<strong className="text-gray-900 dark:text-gray-100">
								For OpenAI:
							</strong>
						</p>
						<ol className="list-decimal list-inside ml-4 space-y-1">
							<li>Get API key from platform.openai.com</li>
							<li>
								Set{" "}
								<code className="bg-gray-200 dark:bg-gray-700 px-1 rounded text-gray-800 dark:text-gray-200">
									OPENAI_API_KEY=your_key
								</code>{" "}
								in .env.local
							</li>
							<li>
								Set{" "}
								<code className="bg-gray-200 dark:bg-gray-700 px-1 rounded text-gray-800 dark:text-gray-200">
									AI_SERVICE_PROVIDER=openai
								</code>
							</li>
						</ol>

						<p className="mt-4">
							<strong className="text-gray-900 dark:text-gray-100">
								For Ollama (Local):
							</strong>
						</p>
						<ol className="list-decimal list-inside ml-4 space-y-1">
							<li>Install Ollama from ollama.ai</li>
							<li>
								Run{" "}
								<code className="bg-gray-200 dark:bg-gray-700 px-1 rounded text-gray-800 dark:text-gray-200">
									ollama pull llama2
								</code>
							</li>
							<li>
								Set{" "}
								<code className="bg-gray-200 dark:bg-gray-700 px-1 rounded text-gray-800 dark:text-gray-200">
									AI_SERVICE_PROVIDER=ollama
								</code>
							</li>
						</ol>
					</div>
				</div>
			</div>
		</div>
	);
}
