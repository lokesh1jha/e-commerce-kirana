"use client";

import { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import { Sidebar, SidebarBody } from "@/components/ui/sidebar";
import LoadingSpinner, { LoadingPage } from "@/components/ui/LoadingSpinner";
import ProductCard from "@/components/ProductCard";

interface ProductVariant {
  id: string;
  unit: string;
  amount: number;
  price: number;
  stock: number;
  sku?: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  images: string[];
  variants: ProductVariant[];
  createdAt: string;
  categoryId?: string | null;
}

interface Category { id: string; name: string; slug: string }

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    // reset when category changes
    setProducts([]);
    setPage(1);
    setHasMore(true);
    fetchProducts(1, true);
  }, [selectedCategory]);

  useEffect(() => {
    const filtered = products.filter(product => {
      const matchesText = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesText;
    });
    setFilteredProducts(filtered);
  }, [searchTerm, products]);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      const list: Category[] = data.categories || [];
      setCategories(list);
      if (list.length > 0) setSelectedCategory(list[0].id);
    } catch {
      setCategories([]);
    }
  };

  const fetchProducts = async (nextPage = page, replace = false) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set("limit", "20");
      params.set("page", String(nextPage));
      if (selectedCategory) params.set("categoryId", selectedCategory);
      const response = await fetch(`/api/products?${params.toString()}`);
      const data = await response.json();
      const list: Product[] = data.data || [];
      setProducts((prev) => (replace ? list : [...prev, ...list]));
      setHasMore(list.length === 20);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  // infinite scroll
  useEffect(() => {
    function onScroll() {
      if (loadingMore || !hasMore) return;
      const nearBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 300;
      if (nearBottom) {
        setLoadingMore(true);
        const next = page + 1;
        fetchProducts(next).then(() => {
          setPage(next);
          setLoadingMore(false);
        });
      }
    }
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [page, hasMore, loadingMore, selectedCategory]);

  // helpers no longer needed here as ProductCard shows price and variants

  return (
    <div className="container max-w-screen-2xl py-8">
      <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-0">
        {/* Left: Category Sidebar - Desktop */}
        <div className="hidden md:block">
          <Sidebar animate={false} open={true}>
            <SidebarBody className="h-full !px-0 !py-0">
              <div className="h-full w-full bg-neutral-100 dark:bg-neutral-800 p-4 border-r border-gray-200 dark:border-gray-800">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">Categories</h3>
                <div className="flex flex-col gap-1">
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCategory(c.id)}
                      className={`text-left px-3 py-2 rounded-md text-sm transition ${selectedCategory === c.id ? "bg-white dark:bg-neutral-700 shadow" : "hover:bg-white/60 dark:hover:bg-neutral-700/60"}`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
            </SidebarBody>
          </Sidebar>
        </div>

        {/* Right: Products */}
        <div className="md:pl-0">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-4">Our Products</h1>
            
            {/* Mobile Category Selector */}
            <div className="md:hidden mb-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Categories</h3>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCategory(c.id)}
                    className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition ${
                      selectedCategory === c.id 
                        ? "bg-blue-600 text-white shadow-md" 
                        : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="max-w-md">
              <Input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <LoadingPage message="Loading products..." />
          ) : filteredProducts.length === 0 ? (
            <Card className="p-8 text-center">
              <h3 className="text-lg font-semibold mb-2">No products found</h3>
              <p className="text-gray-600 dark:text-gray-300">
                {searchTerm ? "Try adjusting your search terms" : "No products available for this category"}
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
          {loadingMore && (
            <div className="flex justify-center py-6">
              <LoadingSpinner />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
