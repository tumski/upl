'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { trpc } from '@/utils/trpc';

// Define print sizes with their aspect ratios
const PRINT_SIZES = {
  '4x6': { width: 6, height: 4, ratio: 1.5 },
  '5x7': { width: 7, height: 5, ratio: 1.4 },
  '8x10': { width: 10, height: 8, ratio: 1.25 },
  '11x14': { width: 14, height: 11, ratio: 1.27 },
  '16x20': { width: 20, height: 16, ratio: 1.25 },
  '20x30': { width: 30, height: 20, ratio: 1.5 }
} as const;

// Define frame colors with their CSS values
const FRAME_COLORS = {
  none: '',
  white: '#FFFFFF',
  black: '#000000',
  natural: '#D4B59D',
  walnut: '#4A3728',
  gold: '#CFB53B'
} as const;

// Add price calculation constants
const PRICE_BASE = 10.00;  // Base price
const PRICE_MULTIPLIERS = {
  '4x6': 1.0,
  '5x7': 1.2,
  '8x10': 1.5,
  '11x14': 2.0,
  '16x20': 2.5,
  '20x30': 3.0
} as const;

const PRICE_EXTRAS = {
  paperType: {
    'matte': 0,
    'glossy': 0.5
  },
  frameColor: {
    'none': 0,
    'white': 5,
    'black': 5,
    'natural': 10,
    'walnut': 15,
    'gold': 20
  }
} as const;

export type PrintSize = keyof typeof PRINT_SIZES;
export type PaperType = 'matte' | 'glossy';
export type FrameColor = keyof typeof FRAME_COLORS;

interface FormatFormProps {
  imageUrl: string;
  initialValues?: {
    size?: PrintSize;
    paperType?: PaperType;
    frameColor?: FrameColor;
  };
  onBack: () => void;
  mode: 'create' | 'edit';
  itemId?: string;
  orderId?: string;
}

export default function FormatForm({ 
  imageUrl, 
  initialValues, 
  onBack,
  mode,
  itemId,
  orderId
}: FormatFormProps) {
  const t = useTranslations('Format');
  const router = useRouter();
  const params = useParams<{ locale: string }>();
  const [selectedSize, setSelectedSize] = useState<PrintSize | null>(initialValues?.size || null);
  const [paperType, setPaperType] = useState<PaperType>(initialValues?.paperType || 'matte');
  const [frameColor, setFrameColor] = useState<FrameColor>(initialValues?.frameColor || 'none');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get mutations
  const createOrderMutation = trpc.orders.createWithItem.useMutation();
  const updateItemMutation = trpc.orders.updateItem.useMutation();
  const addItemToOrderMutation = trpc.orders.addItemToOrder.useMutation();

  const handleSizeChange = (size: PrintSize) => {
    setSelectedSize(size);
    // Save format settings to localStorage
    const currentSettings = JSON.parse(localStorage.getItem('formatSettings') || '{}');
    localStorage.setItem('formatSettings', JSON.stringify({
      ...currentSettings,
      size
    }));
  };

  const handlePaperTypeChange = (value: PaperType) => {
    setPaperType(value);
    // Save format settings to localStorage
    const currentSettings = JSON.parse(localStorage.getItem('formatSettings') || '{}');
    localStorage.setItem('formatSettings', JSON.stringify({
      ...currentSettings,
      paperType: value
    }));
  };

  const handleFrameColorChange = (value: FrameColor) => {
    setFrameColor(value);
    // Save format settings to localStorage
    const currentSettings = JSON.parse(localStorage.getItem('formatSettings') || '{}');
    localStorage.setItem('formatSettings', JSON.stringify({
      ...currentSettings,
      frameColor: value
    }));
  };

  // Add price calculation
  const calculatePrice = () => {
    if (!selectedSize) return 0;

    let price = PRICE_BASE;
    price *= PRICE_MULTIPLIERS[selectedSize];
    price += PRICE_EXTRAS.paperType[paperType];
    price += PRICE_EXTRAS.frameColor[frameColor];

    return price.toFixed(2);
  };

  const handleSubmit = async () => {
    if (!selectedSize || !imageUrl) return;

    setIsSubmitting(true);
    try {
      // Calculate total amount in cents
      const priceInCents = Math.round(parseFloat(calculatePrice().toString()) * 100);

      if (mode === 'create') {
        // Check if we have an existing order
        const existingOrderId = localStorage.getItem("currentOrderId");

        if (existingOrderId) {
          // Add item to existing order
          const result = await addItemToOrderMutation.mutateAsync({
            orderId: existingOrderId,
            item: {
              name: `${selectedSize} ${paperType} print`,
              originalImageUrl: imageUrl,
              size: selectedSize,
              format: paperType,
              price: priceInCents,
              amount: 1,
              sku: 'dummy'
            },
          });

          // Redirect to order page
          router.push(`/${params.locale}/order/${existingOrderId}`);
        } else {
          // Create new order with item
          const result = await createOrderMutation.mutateAsync({
            totalAmount: priceInCents,
            currency: "EUR",
            item: {
              name: `${selectedSize} ${paperType} print`,
              originalImageUrl: imageUrl,
              size: selectedSize,
              format: paperType,
              price: priceInCents,
              amount: 1,
              sku: 'dummy'
            },
          });

          // Save order ID to localStorage
          localStorage.setItem("currentOrderId", result.order.id);

          // Redirect to order page
          router.push(`/${params.locale}/order/${result.order.id}`);
        }
      } else {
        // Update existing item
        if (!itemId) throw new Error('Item ID is required for updates');
        
        await updateItemMutation.mutateAsync({
          id: itemId,
          name: `${selectedSize} ${paperType} print`,
          size: selectedSize,
          format: paperType,
          price: priceInCents,
          amount: 1,
        });

        // Redirect back to order page
        if (!orderId) throw new Error('Order ID is required for updates');
        router.push(`/${params.locale}/order/${orderId}`);
      }
    } catch (error) {
      console.error("Failed to process item:", error);
      // TODO: Show error toast
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">
        {t('title')}
      </h1>
      
      <div className="grid gap-8 md:grid-cols-2">
        {/* Image Preview */}
        <div>
          <div className={`relative aspect-square w-full max-w-md mx-auto ${frameColor !== 'none' ? 'p-6' : ''}`} style={{
            backgroundColor: frameColor !== 'none' ? FRAME_COLORS[frameColor] : undefined,
            borderRadius: frameColor !== 'none' ? '8px' : undefined,
          }}>
            <div className={`relative w-full h-full ${frameColor !== 'none' ? 'bg-white' : ''}`}>
              <Image
                src={imageUrl}
                alt={t('previewAlt')}
                fill
                className="object-contain rounded-lg"
                style={{
                  aspectRatio: selectedSize ? `${PRINT_SIZES[selectedSize].width}/${PRINT_SIZES[selectedSize].height}` : undefined,
                  objectFit: 'contain',
                  padding: frameColor !== 'none' ? '8px' : undefined,
                }}
              />
            </div>
          </div>
          <div className="mt-4">
            <Button
              variant="outline"
              onClick={onBack}
              className="w-full"
            >
              {t('changeImage')}
            </Button>
          </div>
        </div>

        {/* Format Options */}
        <div className="space-y-6">
          <div className="bg-muted p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">{t('formatOptions')}</h2>
            
            <div className="space-y-6">
              {/* Print Size Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  {t('sizeLabel')}
                </label>
                <Select
                  value={selectedSize || undefined}
                  onValueChange={(value) => handleSizeChange(value as PrintSize)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t('sizePlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(PRINT_SIZES).map((size) => (
                      <SelectItem key={size} value={size}>
                        {t(`sizes.${size}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Paper Type Selection */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">{t('paperLabel')}</Label>
                <RadioGroup
                  value={paperType}
                  onValueChange={(value) => handlePaperTypeChange(value as PaperType)}
                  className="grid gap-4"
                >
                  {(['matte', 'glossy'] as const).map((type) => (
                    <div key={type} className="flex items-start space-x-3">
                      <RadioGroupItem value={type} id={type} className="mt-1" />
                      <Label htmlFor={type} className="grid gap-1.5 leading-none">
                        <div className="font-medium">{t(`paperTypes.${type}`)}</div>
                        <div className="text-sm text-muted-foreground">
                          {t(`paperDescriptions.${type}`)}
                        </div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Frame Color Selection */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">{t('frameLabel')}</Label>
                <RadioGroup
                  value={frameColor}
                  onValueChange={(value) => handleFrameColorChange(value as FrameColor)}
                  className="grid gap-4"
                >
                  {(Object.keys(FRAME_COLORS) as FrameColor[]).map((color) => (
                    <div key={color} className="flex items-start space-x-3">
                      <RadioGroupItem value={color} id={color} className="mt-1" />
                      <Label htmlFor={color} className="grid gap-1.5 leading-none">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{t(`frames.${color}`)}</span>
                          {color !== 'none' && (
                            <div
                              className="w-4 h-4 rounded-full border"
                              style={{ backgroundColor: FRAME_COLORS[color] }}
                            />
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {t(`frameDescriptions.${color}`)}
                        </div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </div>
          </div>

          {/* Price and Submit */}
          <div className="space-y-4 pt-4 border-t">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">{t('total')}</span>
              <span className="text-2xl font-bold">€{calculatePrice()}</span>
            </div>

            <Button
              className="w-full"
              size="lg"
              onClick={handleSubmit}
              disabled={!selectedSize || isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  {t('processing')}
                </div>
              ) : mode === 'create' ? (
                t('orderButton')
              ) : (
                t('updateItem')
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 