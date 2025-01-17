use reqwest::Client;
use serde_json::json;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let api_url = "http://localhost:8085/api/graphql";

    // Define the GraphQL query
    let query = r#"
        query {
            humidity_0(
                filter: {
                    humidityValue: { gteq: 4, lt: 1000 }
                }
                sort: [
                    { field: "timestamp" }
                ]
                limit: 100
            ) {
                humidityValue
                timestamp
            }
        }
    "#;

    // Construct the JSON payload
    let payload = json!({ "query": query });

    // Create an HTTP client
    let client = Client::new();

    // Send the POST request
    let response = client
        .post(api_url)
        .header("Content-Type", "application/json")
        .json(&payload)
        .send()
        .await?;

    let status = response.status();
    // Parse and print the response
    if status.is_success() {
        let response_body: serde_json::Value = response.json().await?;
        println!("Response: {:#?}", response_body);
    } else {
        
        // Clone response for error handling
        let error_body = response.text().await?;
        println!("Error: {} - {}", status, error_body);
    }

    Ok(())
}
