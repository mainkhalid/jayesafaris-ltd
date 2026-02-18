import React from "react";
import HeroSection          from "../components/shared/HeroSection";
import QuoteSection         from "../components/shared/QuoteSection";
import WhyChoose            from "../components/shared/WhyChoose";
import PopularPackages      from "../components/shared/PopularPackages";
import FeaturedDestinations from "../components/shared/FeaturedDestinations";
import TopPackages          from "../components/shared/TopPackages";
import { usePackages }      from "../hooks/usePackage";

const CountryPage = ({ countryData }) => {
  const countryName = countryData?.country ?? "";
  const { packages, loading } = usePackages(countryName);

  const hasDBPackages = packages.length > 0;

  const popularPackages = hasDBPackages
    ? packages.slice(0, 3).map((pkg) => ({
        id:          pkg._id ?? pkg.id,
        title:       pkg.title,
        description: pkg.description ?? "",
        image:       pkg.thumbnail?.url ?? "",
        highlights:  [],
        footer:      pkg.duration ? `Duration: ${pkg.duration}` : "",
        ctaText:     "Book This Tour",
        ctaLink:     `/packages/${pkg._id ?? pkg.id}`,
      }))
    : countryData.popularPackages ?? [];

  const featuredDestinations = hasDBPackages && packages.length > 3
    ? packages.slice(3, 7).map((pkg) => ({
        id:          pkg._id ?? pkg.id,
        title:       pkg.title,
        description: pkg.description ?? "",
        image:       pkg.thumbnail?.url ?? "",
        link:        `/packages/${pkg._id ?? pkg.id}`,
      }))
    : countryData.featuredDestinations ?? [];

  const topPackagesData = {
    ...countryData.topPackages,
    packages: hasDBPackages ? packages : (countryData.topPackages?.packages ?? []),
  };

  return (
    <div className="country-page">
      <HeroSection data={countryData.hero} />

      {countryData.quoteSection && (
        <QuoteSection data={countryData.quoteSection} />
      )}

      <WhyChoose data={countryData.whyChoose} />

      <PopularPackages
        data={popularPackages}
        title={countryName}
        loading={loading}
      />

      <FeaturedDestinations
        data={featuredDestinations}
        title={`Featured ${countryName} Safari Destinations`}
        loading={loading}
      />

      {countryData.topPackages && (
        <TopPackages
          data={topPackagesData}
          loading={loading}
        />
      )}
    </div>
  );
};

export default CountryPage;