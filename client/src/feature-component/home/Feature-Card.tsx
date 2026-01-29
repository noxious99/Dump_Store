import React from 'react';
import feature_img_spend from '../../assets/feature_img_expense.png';
import feature_img_loan from '../../assets/feature_img_loan.png';
import feature_img_goal from '../../assets/feature_img_goal.png';
import { MdAttachMoney } from "react-icons/md";
import { FaBalanceScale } from "react-icons/fa";
import { FiTarget } from "react-icons/fi";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
} from "@/components/ui/card";

type FeatureType = "spend" | "loan" | "goal";

interface FeatureCardProps {
    iconColor?: string;
    iconBg?: string;
    heading?: string;
    title: FeatureType;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ iconColor, iconBg, heading, title }) => {
    const icons: Record<FeatureType, React.ElementType> = {
        spend: MdAttachMoney,
        loan: FaBalanceScale,
        goal: FiTarget,
    };

    const featureImages: Record<FeatureType, string> = {
        spend: feature_img_spend,
        loan: feature_img_loan,
        goal: feature_img_goal,
    };

    const featureTextBody: Record<FeatureType, string> = {
        spend: "Track your income and expenses, categorize transactions, and get clear insights into where your money goes with intuitive charts.",
        loan: "Keep track of money you've lent or borrowed. Never forget an IOU — stay organized and settle balances with confidence.",
        goal: "Set any goal — learning, fitness, career. Break it into daily and weekly tasks, build streaks, and hit milestones to stay motivated.",
    };

    const colorAccent: Record<FeatureType, string> = {
        spend: "from-primary/5 to-card hover:from-primary/10",
        loan: "from-error/5 to-card hover:from-error/10",
        goal: "from-success/5 to-card hover:from-success/10",
    };

    const borderAccent: Record<FeatureType, string> = {
        spend: "hover:border-primary/30",
        loan: "hover:border-error/30",
        goal: "hover:border-success/30",
    };

    const IconComponent = icons[title];
    const ImageComponent = featureImages[title];

    return (
        <Card
            className={`relative w-full max-w-[340px] overflow-hidden border border-border/50 shadow-sm bg-gradient-to-br ${colorAccent[title]} ${borderAccent[title]} hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-out rounded-2xl`}
            role="article"
            aria-labelledby={`feature-${title}-heading`}
        >
            <CardHeader className="flex flex-col items-start space-y-3 pb-0">
                <div
                    className={`${iconBg} w-12 h-12 flex justify-center items-center rounded-xl shadow-sm transition-transform duration-300 hover:scale-110`}
                    aria-hidden="true"
                >
                    <IconComponent className={`text-2xl ${iconColor}`} />
                </div>
                <CardDescription
                    id={`feature-${title}-heading`}
                    className="text-lg font-semibold text-foreground tracking-wide"
                >
                    {heading}
                </CardDescription>
            </CardHeader>

            <CardContent className="pt-3 min-h-[96px]">
                <p className="text-sm text-muted-foreground leading-relaxed">
                    {featureTextBody[title]}
                </p>
            </CardContent>

            <CardFooter className="pt-4">
                <img
                    src={ImageComponent}
                    alt={`${heading} preview`}
                    className="w-full h-auto rounded-xl shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-300"
                    loading="lazy"
                />
            </CardFooter>
        </Card>
    );
};

export default FeatureCard;
