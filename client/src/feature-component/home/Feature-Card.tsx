
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

    const featureTextBody = {
        spend: "Effortlessly categorize your expenses, visualize spending patterns, and stay within budget with intuitive charts and reports.",
        loan: "Easily record, track, and manage money lent or borrowed — keep every IOU organized and settle balances with confidence.",
        goal: "Set clear goals, track your progress, and stay motivated with visual milestones that turn ambitions into achievements.",
    };

    const colorAccent: Record<FeatureType, string> = {
        spend: "from-indigo-50 to-white hover:from-indigo-100",
        loan: "from-red-50 to-white hover:from-red-100",
        goal: "from-green-50 to-white hover:from-green-100",
    };

    const IconComponent = icons[title];
    const ImageComponent = featureImages[title];

    return (
        <Card
            className={`relative w-[320px] lg:w-[340px] overflow-hidden border border-gray-100 shadow-sm bg-gradient-to-br ${colorAccent[title]} hover:shadow-xl hover:-translate-y-1 transition-all duration-400 ease-out rounded-2xl`}
        >
            <CardHeader className="flex flex-col items-start space-y-3 pb-0">
                <div
                    className={`${iconBg} w-[50px] h-[50px] flex justify-center items-center rounded-xl shadow-md hover:shadow-lg backdrop-blur-sm transition-transform duration-300 hover:scale-110`}
                >
                    <IconComponent className={`text-2xl ${iconColor}`} />
                </div>
                <CardDescription className="text-lg font-semibold text-gray-800 tracking-wide">
                    {heading}
                </CardDescription>
            </CardHeader>

            <CardContent className="pt-3 h-[96px]">
                <p className="text-sm text-gray-600 leading-relaxed">
                    {featureTextBody[title]}
                </p>
            </CardContent>

            <CardFooter className="pt-5">
                <img
                    src={ImageComponent}
                    alt="Feature"
                    className="w-full h-auto rounded-xl shadow-md hover:shadow-lg hover:scale-[1.02] transition-transform duration-400"
                />
            </CardFooter>
        </Card>
    );
};

export default FeatureCard;

