import React from 'react';
import feature_img_spend from '../../assets/feature_img_expense.png'
import feature_img_loan from '../../assets/feature_img_loan.png'
import feature_img_goal from '../../assets/feature_img_goal.png'
import { MdAttachMoney } from "react-icons/md";
import { FaBalanceScale } from "react-icons/fa";
import { FiTarget } from "react-icons/fi";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";


type FeatureType = "spend" | "loan" | "goal";

interface FeatureCardProps {
    iconColor?: string;
    iconBg?: string;
    heading?: string;
    title: FeatureType;
}


const FeatureCard: React.FC<FeatureCardProps> = ({iconColor, iconBg, heading, title}) => {
    const icons: Record<FeatureType, React.ElementType> = {
        spend: MdAttachMoney,
        loan: FaBalanceScale,
        goal: FiTarget
    }
    const featureImages: Record<FeatureType, string> = {
        spend: feature_img_spend,
        loan: feature_img_loan,
        goal: feature_img_goal
    }
    const featureTextBody = {
        spend: "Effortlessly categorize your expenses, visualize spending patterns, and stay within budget with intuitive charts and reports.",
        loan: "Easily record, track, and manage money lent or borrowed — keep every IOU organized and settle balances with confidence.",
        goal: "Set clear goals, track your progress, and stay motivated with visual milestones that turn ambitions into achievements."
    }
    const IconComponent = icons[title];
    const ImageComponent = featureImages[title]
    return (
        <Card className="w-[280px] lg:w-[320px] hover:scale-105 hover:shadow-lg hover:shadow-secondary/30 transition-all duration-300">
            <CardHeader>
                <CardTitle className={`${iconBg} w-[36px] h-[36px] flex justify-center items-center rounded-full`}>
                    <IconComponent className={`text-2xl ${iconColor}`}/>
                </CardTitle>
                <CardDescription className="text-base font-semibold text-dark">{heading}</CardDescription>
            </CardHeader>
            <CardContent className='h-[96px]'>
                <p className="text-sm mb-4">{featureTextBody[title]}</p>
            </CardContent>
            <CardFooter >
                <img src={ImageComponent} alt="Feature" className="w-full h-auto rounded-lg"/>
            </CardFooter>
        </Card>
    );
};

export default FeatureCard;
