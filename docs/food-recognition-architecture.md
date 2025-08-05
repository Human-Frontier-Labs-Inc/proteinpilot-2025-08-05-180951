# Food Recognition API Integration Architecture

## Overview
ProteinPilot's core feature is automated protein tracking through food image recognition. This document outlines the architecture for integrating food recognition APIs and building a robust, scalable system.

## API Provider Options

### 1. Primary Option: Google Cloud Vision API + Custom Model
- **Vision API**: For general object detection
- **AutoML**: Train custom model on food-specific dataset
- **Advantages**: High accuracy, HIPAA-compliant infrastructure
- **Cost**: ~$1.50 per 1000 images

### 2. Alternative: Clarifai Food Model
- **Pre-trained**: Food-specific model ready to use
- **Advantages**: Quick implementation, good accuracy
- **Cost**: ~$2.00 per 1000 images

### 3. Backup: OpenAI Vision API
- **GPT-4 Vision**: General purpose vision model
- **Advantages**: Already integrated in template, good for fallback
- **Cost**: Variable based on tokens

## System Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   User Device   │────▶│   Next.js API    │────▶│ Food Recognition│
│  (Upload Image) │     │    /api/food/    │     │      APIs       │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                               │                           │
                               ▼                           ▼
                        ┌──────────────────┐     ┌─────────────────┐
                        │   Image Storage  │     │ Nutrition DB API│
                        │  (S3/Cloudinary) │     │   (Nutritionix) │
                        └──────────────────┘     └─────────────────┘
                               │                           │
                               ▼                           ▼
                        ┌──────────────────┐     ┌─────────────────┐
                        │    PostgreSQL    │     │   Redis Cache   │
                        │   (Food Logs)    │     │ (Nutrition Data)│
                        └──────────────────┘     └─────────────────┘
```

## API Integration Flow

### 1. Image Upload & Processing
```typescript
// app/api/food/recognize/route.ts
export async function POST(req: Request) {
  // 1. Validate user authentication
  const { userId } = auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });
  
  // 2. Check rate limits
  const canProceed = await checkApiLimit(userId);
  if (!canProceed) return new Response("API limit reached", { status: 429 });
  
  // 3. Process image upload
  const formData = await req.formData();
  const image = formData.get('image') as File;
  
  // 4. Upload to secure storage
  const imageUrl = await uploadToStorage(image, userId);
  
  // 5. Call recognition API
  const recognitionResults = await recognizeFood(imageUrl);
  
  // 6. Get nutrition data
  const nutritionData = await getNutritionInfo(recognitionResults);
  
  // 7. Log for audit trail
  await logAccess({
    userId,
    action: 'food_recognition',
    resource: 'image',
    outcome: 'success'
  });
  
  // 8. Return results
  return NextResponse.json({
    recognizedItems: recognitionResults,
    nutritionData,
    imageUrl
  });
}
```

### 2. Food Recognition Service
```typescript
// lib/services/food-recognition.ts
interface RecognitionResult {
  name: string;
  confidence: number;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export async function recognizeFood(imageUrl: string): Promise<RecognitionResult[]> {
  // Primary: Google Vision API
  try {
    const visionClient = new ImageAnnotatorClient();
    const [result] = await visionClient.objectLocalization(imageUrl);
    
    const foodItems = result.localizedObjectAnnotations
      .filter(obj => isFoodCategory(obj.name))
      .map(obj => ({
        name: obj.name,
        confidence: obj.score,
        boundingBox: extractBoundingBox(obj.boundingPoly)
      }));
    
    // If low confidence, try custom model
    if (foodItems.length === 0 || foodItems[0].confidence < 0.7) {
      return await fallbackToCustomModel(imageUrl);
    }
    
    return foodItems;
  } catch (error) {
    // Fallback to OpenAI Vision
    return await recognizeWithOpenAI(imageUrl);
  }
}

async function recognizeWithOpenAI(imageUrl: string): Promise<RecognitionResult[]> {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  
  const response = await openai.chat.completions.create({
    model: "gpt-4-vision-preview",
    messages: [{
      role: "user",
      content: [
        {
          type: "text",
          text: "Identify all food items in this image. For each item, provide the name and estimated confidence (0-1). Format: JSON array with {name, confidence}"
        },
        {
          type: "image_url",
          image_url: { url: imageUrl }
        }
      ]
    }],
    max_tokens: 300
  });
  
  return JSON.parse(response.choices[0].message.content);
}
```

### 3. Nutrition Database Integration
```typescript
// lib/services/nutrition.ts
interface NutritionInfo {
  foodItemId?: string;
  name: string;
  brand?: string;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  servingSize: number;
  servingUnit: string;
}

export async function getNutritionInfo(
  recognizedItems: RecognitionResult[]
): Promise<NutritionInfo[]> {
  const nutritionData: NutritionInfo[] = [];
  
  for (const item of recognizedItems) {
    // Check cache first
    const cached = await redis.get(`nutrition:${item.name}`);
    if (cached) {
      nutritionData.push(JSON.parse(cached));
      continue;
    }
    
    // Check our database
    const dbFood = await prisma.foodItem.findFirst({
      where: { 
        name: { contains: item.name, mode: 'insensitive' } 
      }
    });
    
    if (dbFood) {
      const data = mapFoodItemToNutrition(dbFood);
      nutritionData.push(data);
      await redis.set(`nutrition:${item.name}`, JSON.stringify(data), 'EX', 86400);
      continue;
    }
    
    // Fallback to Nutritionix API
    const apiData = await fetchFromNutritionix(item.name);
    if (apiData) {
      nutritionData.push(apiData);
      await redis.set(`nutrition:${item.name}`, JSON.stringify(apiData), 'EX', 86400);
      
      // Store in our database for future use
      await prisma.foodItem.create({
        data: {
          name: apiData.name,
          brand: apiData.brand,
          calories: apiData.calories,
          protein: apiData.protein,
          carbohydrates: apiData.carbohydrates,
          fat: apiData.fat,
          servingSize: apiData.servingSize,
          servingUnit: apiData.servingUnit,
          verified: false
        }
      });
    }
  }
  
  return nutritionData;
}
```

### 4. Image Storage Service
```typescript
// lib/services/image-storage.ts
export async function uploadToStorage(
  file: File, 
  userId: string
): Promise<string> {
  // Encrypt filename for privacy
  const encryptedName = encrypt(`${userId}_${Date.now()}_${file.name}`);
  
  // Option 1: AWS S3 (HIPAA compliant with BAA)
  const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
  });
  
  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: `food-images/${encryptedName}`,
    Body: Buffer.from(await file.arrayBuffer()),
    ContentType: file.type,
    ServerSideEncryption: 'AES256',
    Metadata: {
      userId: encrypt(userId),
      uploadDate: new Date().toISOString()
    }
  });
  
  await s3Client.send(command);
  
  // Return signed URL (expires in 1 hour)
  const getCommand = new GetObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: `food-images/${encryptedName}`
  });
  
  const url = await getSignedUrl(s3Client, getCommand, { expiresIn: 3600 });
  return url;
}
```

## Error Handling & Fallbacks

### Recognition Confidence Thresholds
- **High (>0.8)**: Auto-populate nutrition data
- **Medium (0.5-0.8)**: Show top 3 matches for user selection
- **Low (<0.5)**: Prompt manual entry with suggestions

### API Failure Handling
```typescript
class FoodRecognitionService {
  private providers = [
    { name: 'google', fn: this.googleVision, priority: 1 },
    { name: 'clarifai', fn: this.clarifai, priority: 2 },
    { name: 'openai', fn: this.openai, priority: 3 }
  ];
  
  async recognize(imageUrl: string): Promise<RecognitionResult[]> {
    const errors: Error[] = [];
    
    for (const provider of this.providers.sort((a, b) => a.priority - b.priority)) {
      try {
        const results = await provider.fn(imageUrl);
        if (results.length > 0) {
          await this.logUsage(provider.name, 'success');
          return results;
        }
      } catch (error) {
        errors.push(error);
        await this.logUsage(provider.name, 'failure');
      }
    }
    
    // All failed - return manual entry prompt
    throw new AggregateError(errors, 'All recognition providers failed');
  }
}
```

## Performance Optimization

### 1. Image Preprocessing
- Resize images client-side before upload (max 1024x1024)
- Convert to WebP format for smaller file size
- Compress while maintaining quality for recognition

### 2. Caching Strategy
- **Redis**: Cache nutrition data (24 hour TTL)
- **CDN**: Cache processed images (7 day TTL)
- **Database**: Store verified food items permanently

### 3. Batch Processing
- Queue multiple recognitions for bulk meal logging
- Process in background jobs for better UX
- Aggregate API calls where possible

## Security Considerations

### 1. Image Privacy
- Encrypt image filenames and metadata
- Use signed URLs with expiration
- Auto-delete images after processing (configurable)
- No facial recognition or personal info extraction

### 2. API Key Management
- Rotate API keys quarterly
- Use environment variables
- Implement key vault for production
- Monitor usage for anomalies

### 3. Rate Limiting
```typescript
const rateLimiter = new Ratelimiter({
  redis,
  key: (userId) => `ratelimit:${userId}`,
  max: 100, // requests
  window: 60 * 60 * 1000 // per hour
});
```

## Cost Management

### Estimated Costs per User
- **Free Tier**: 10 recognitions/day = ~$0.015/day
- **Pro Tier**: 100 recognitions/day = ~$0.15/day
- **Storage**: ~$0.02/GB/month

### Cost Optimization
1. Implement smart caching to reduce API calls
2. Use batch processing for multiple items
3. Offer manual entry as primary option
4. Progressive enhancement with recognition

## Implementation Phases

### Phase 1: MVP (Week 1)
- Integrate OpenAI Vision (already in template)
- Basic image upload and storage
- Simple nutrition database lookup
- Manual confirmation flow

### Phase 2: Enhanced Recognition (Week 2)
- Add Google Vision API
- Implement confidence thresholds
- Build nutrition cache
- Add batch processing

### Phase 3: Production Ready (Week 3)
- Multi-provider fallback system
- Advanced error handling
- Performance optimization
- Cost monitoring dashboard

## Monitoring & Analytics

### Key Metrics
- Recognition accuracy rate
- API response times
- Cost per recognition
- User satisfaction scores
- Cache hit rates

### Logging
```typescript
interface RecognitionLog {
  userId: string;
  timestamp: Date;
  provider: string;
  imageSize: number;
  recognitionTime: number;
  itemsFound: number;
  confidence: number;
  cost: number;
  success: boolean;
}
```

## Future Enhancements

1. **Custom Model Training**
   - Collect user-verified data
   - Train specialized protein-rich food model
   - Improve accuracy over time

2. **Portion Size Estimation**
   - Use object detection for size reference
   - ML model for weight estimation
   - Integration with smart scales

3. **Meal Context Understanding**
   - Recognize complete meals
   - Suggest missing nutrients
   - Recipe reconstruction